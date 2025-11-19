import Cart from '../models/Cart.js';
import CartItem from '../models/CartItemm.js';
import CartItemService from '../models/CartItemmService.js';
import Rooms from '../models/Rooms.js';
import MsRoomType from '../models/msRoomTypes.js';
import MsServices from '../models/msServices.js';

// Generate unique cart session ID
const generateCartId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getOrCreateCart = async (req) => {
  console.log('🔍 CART DEBUG - User:', req.user?.id, 'Session:', req.sessionID);

  if (!req.user?.id) {
    console.log('❌ NO USER ID - User must be logged in to use cart');
    throw new Error('Authentication required. Please login to use cart.');
  }

  console.log('👤 User logged in, finding user cart for ID:', req.user.id);
  
  let userCart = await Cart.findOne({
    where: { user_id: req.user.id }
  });
  
  if (userCart) {
    console.log('📦 Existing user cart found:', userCart.cart_id, 'for user:', userCart.user_id);
    return userCart;
  } else {
    // Buat cart baru untuk user
    userCart = await Cart.create({
      session_id: generateCartId(),
      user_id: req.user.id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    console.log('🆕 New user cart created:', userCart.cart_id, 'for user:', userCart.user_id);
    return userCart;
  }
};

export const authorizeCart = async (req, res, next) => {
  try {
    console.log('🔐 CART AUTH - Checking user:', req.user?.id);
    
    if (!req.user?.id) {
      console.log('❌ No user ID - verifyToken middleware mungkin tidak bekerja');
      return res.status(401).json({
        success: false,
        message: 'Please login to access cart'
      });
    }

    const cart = await getOrCreateCart(req);
    
    console.log('🔐 CART AUTH - User:', req.user.id, 'Cart User:', cart.user_id);
    
    if (cart.user_id !== req.user.id) {
      console.log('❌ Cart authorization failed: User mismatch');
      return res.status(403).json({
        success: false,
        message: 'Access denied: This cart belongs to another user'
      });
    }
    
    req.cart = cart; // Attach cart ke request
    next();
  } catch (error) {
    console.error('Cart auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Cart authorization failed: ' + error.message
    });
  }
};

const updateCartItemTotalPrice = async (cartItemId) => {
  try {
    const cartItem = await CartItem.findByPk(cartItemId, {
      include: [{
        model: MsServices,
        as: 'services',
        through: { attributes: ['total_price'] }
      }]
    });

    if (!cartItem) return;

    // Calculate room total (base price)
    const roomTotal = parseFloat(cartItem.room_data?.price || 0) * cartItem.nights;
    
    // Calculate services total
    const servicesTotal = cartItem.services.reduce((sum, service) => {
      return sum + parseFloat(service.CartItemService.total_price || 0);
    }, 0);

    // Update cart item total
    const newTotalPrice = roomTotal + servicesTotal;
    await cartItem.update({
      total_price: newTotalPrice
    });

    console.log('💰 Updated cart item total:', newTotalPrice);
    
  } catch (error) {
    console.error('Update cart item price error:', error);
  }
};

// ADD TO CART - pakai cart dari middleware
export const addToCart = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, rooms } = req.body;
    
    console.log('🛒 Add to cart - User:', req.user.id, 'Cart:', req.cart.cart_id);

    // Validasi data
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const utcCheckIn = new Date(checkIn + 'T00:00:00Z');
    const utcCheckOut = new Date(checkOut + 'T00:00:00Z');

    // Cek duplikat di cart
    const existingItem = await CartItem.findOne({
      where: { 
        cart_id: req.cart.cart_id,
        room_id: roomId,
        check_in: utcCheckIn,
        check_out: utcCheckOut
      }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Room already in cart'
      });
    }

    // Ambil data room
    const room = await Rooms.findByPk(roomId, {
      include: [{
        model: MsRoomType,
        as: 'room_type',
        attributes: ['name', 'price_per_night', 'description', 'room_bed', 'image_url', 'capacity']
      }]
    });
    
    if (!room || !room.room_type) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const roomType = room.room_type;
    const nights = Math.ceil((utcCheckOut - utcCheckIn) / (1000 * 60 * 60 * 24));
    const roomTotalPrice = roomType.price_per_night * nights;

    const cartItem = await CartItem.create({
      cart_id: req.cart.cart_id,
      room_id: roomId,
      check_in: utcCheckIn,
      check_out: utcCheckOut,
      adults: guests.totalAdults,
      children: guests.totalChildren || 0,
      child_ages: rooms ? rooms.flatMap(r => r.childAges || []) : [],
      room_data: {
        name: roomType.name,
        type: roomType.name,
        price: roomType.price_per_night,
        image: roomType.image_url,
        description: roomType.description,
        bed_type: roomType.room_bed,
        capacity: roomType.capacity,
        room_number: room.room_number
      },
      nights: nights,
      total_price: roomTotalPrice // Hanya room price dulu
    });

    console.log('✅ Cart item created for user:', req.user.id);

    res.json({
      success: true,
      message: 'Room added to cart successfully',
      cartItem: {
        id: cartItem.cart_item_id,
        room: cartItem.room_data,
        checkIn: cartItem.check_in,
        checkOut: cartItem.check_out,
        nights: cartItem.nights,
        guests: {
          adults: cartItem.adults,
          children: cartItem.children
        },
        totalPrice: cartItem.total_price,
        services: [] // Empty services array
      }
    });

  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add room to cart'
    });
  }
};

// ✅ ADD SERVICE TO CART ITEM
export const addServiceToCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { serviceId, quantity = 1 } = req.body;
    
    console.log('🛍️ Adding service to cart item:', { cartItemId, serviceId, quantity });

    // Validasi cart item milik user
    const cartItem = await CartItem.findOne({
      where: { 
        cart_item_id: cartItemId,
        '$cart.user_id$': req.user.id // Pastikan cart milik user
      },
      include: [{
        model: Cart,
        as: 'cart',
        attributes: ['user_id']
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Get service data
    const service = await MsServices.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Cek apakah service sudah ada di cart item
    const existingService = await CartItemService.findOne({
      where: {
        cart_item_id: cartItemId,
        service_id: serviceId
      }
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service already added to this cart item'
      });
    }

    // Calculate price based on unit type
    let totalPrice = 0;
    if (service.unit === 'per_booking') {
      totalPrice = parseFloat(service.service_price) * quantity;
    } else if (service.unit === 'per_person') {
      // Hitung berdasarkan total guests di cart item
      const totalGuests = cartItem.adults + cartItem.children;
      totalPrice = parseFloat(service.service_price) * totalGuests * quantity;
    }

    // Add service to cart item
    const cartItemService = await CartItemService.create({
      cart_item_id: cartItemId,
      service_id: serviceId,
      quantity: quantity,
      total_price: totalPrice
    });

    // Update cart item total price
    await updateCartItemTotalPrice(cartItemId);

    // Get updated service data dengan include service details
    const updatedService = await CartItemService.findByPk(cartItemService.cart_item_service_id, {
      include: [{
        model: MsServices,
        as: 'service'
      }]
    });

    res.json({
      success: true,
      message: 'Service added to cart item successfully',
      service: {
        id: updatedService.cart_item_service_id,
        service: updatedService.service,
        quantity: updatedService.quantity,
        totalPrice: updatedService.total_price
      }
    });

  } catch (error) {
    console.error('❌ Add service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add service to cart item'
    });
  }
};

// ✅ REMOVE SERVICE FROM CART ITEM
export const removeServiceFromCartItem = async (req, res) => {
  try {
    const { cartItemServiceId } = req.params;

    // Cari service untuk dapat cart_item_id
    const cartItemService = await CartItemService.findByPk(cartItemServiceId);
    if (!cartItemService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found in cart'
      });
    }

    const deleted = await CartItemService.destroy({
      where: { 
        cart_item_service_id: cartItemServiceId 
      }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Service not found in cart'
      });
    }

    // Update cart item total price
    await updateCartItemTotalPrice(cartItemService.cart_item_id);

    res.json({
      success: true,
      message: 'Service removed from cart item successfully'
    });

  } catch (error) {
    console.error('❌ Remove service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove service from cart item'
    });
  }
};

// GET CART - UPDATED UNTUK INCLUDE SERVICES
export const getCart = async (req, res) => {
  try {
    console.log('🛍️ Getting cart for user:', req.user.id, 'cart:', req.cart.cart_id);
    
    const cartItems = await CartItem.findAll({
      where: { cart_id: req.cart.cart_id },
      include: [{
        model: MsServices,
        as: 'services',
        through: { attributes: ['cart_item_service_id', 'quantity', 'total_price'] }
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('📋 Found cart items:', cartItems.length, 'for user:', req.user.id);

    const formattedCart = cartItems.map(item => {
      let roomData = {};
      try {
        roomData = typeof item.room_data === 'string' 
          ? JSON.parse(item.room_data) 
          : item.room_data;
      } catch (error) {
        roomData = {
          name: "Room",
          price: 0,
          image: "/default-room.jpg",
          description: "Room description",
          bed_type: "No bed information",
          room_number: "-"
        };
      }

      // Format services
      const formattedServices = item.services.map(service => ({
        id: service.CartItemService.cart_item_service_id,
        service: {
          id: service.id_service,
          name: service.name,
          desc: service.desc,
          service_price: service.service_price,
          unit: service.unit
        },
        quantity: service.CartItemService.quantity,
        totalPrice: service.CartItemService.total_price
      }));

      return {
        id: item.cart_item_id,
        room: roomData,
        checkIn: item.check_in,
        checkOut: item.check_out,
        nights: item.nights,
        adults: item.adults,
        children: item.children, 
        guests: {
          adults: item.adults,
          children: item.children
        },
        services: formattedServices,
        totalPrice: item.total_price
      };
    });

    res.json({
      success: true,
      cart: formattedCart
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart items'
    });
  }
};

// REMOVE FROM CART - pakai cart dari middleware
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    console.log('🗑️ Removing item:', itemId, 'from cart:', req.cart.cart_id, 'user:', req.user.id);

    // Hapus services terlebih dahulu (untuk maintain referential integrity)
    await CartItemService.destroy({
      where: { cart_item_id: itemId }
    });

    // Hapus cart item
    const deleted = await CartItem.destroy({
      where: { 
        cart_item_id: itemId,
        cart_id: req.cart.cart_id
      }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};

// CLEAR CART - pakai cart dari middleware
export const clearCart = async (req, res) => {
  try {
    console.log('🧹 Clearing cart:', req.cart.cart_id, 'for user:', req.user.id);
    
    // Hapus semua cart items dan services terkait
    await CartItemService.destroy({
      where: {
        '$cart_item.cart_id$': req.cart.cart_id
      },
      include: [{
        model: CartItem,
        as: 'cart_item'
      }]
    });

    await CartItem.destroy({
      where: { cart_id: req.cart.cart_id }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};