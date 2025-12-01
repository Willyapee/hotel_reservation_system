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
    // Get all services for this cart item
    const services = await CartItemService.findAll({
      where: { cart_item_id: cartItemId }
    });

    const cartItem = await CartItem.findByPk(cartItemId);
    if (!cartItem) return;

    // Calculate room total
    let roomTotal = 0;
    try {
      const roomData = typeof cartItem.room_data === 'string' 
        ? JSON.parse(cartItem.room_data) 
        : cartItem.room_data;
      roomTotal = parseFloat(roomData?.price || 0) * cartItem.nights;
    } catch (error) {
      roomTotal = 0;
    }

    // Calculate services total
    const servicesTotal = services.reduce((sum, service) => {
      return sum + parseFloat(service.total_price || 0);
    }, 0);

    const newTotalPrice = roomTotal + servicesTotal;
    
    await cartItem.update({
      total_price: newTotalPrice
    });

    console.log('💰 Updated cart item total:', {
      cartItemId,
      roomTotal,
      servicesTotal,
      newTotalPrice
    });
    
  } catch (error) {
    console.error('Update cart item price error:', error);
  }
};

// ADD TO CART
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
      total_price: roomTotalPrice
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
        services: []
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

// ADD SERVICE TO CART ITEM
export const addServiceToCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { serviceId, quantity = 1 } = req.body;
    
    console.log('🛍️ [SERVICE] Adding service:', { 
      cartItemId, 
      serviceId, 
      quantity,
      user: req.user.id 
    });

    const cartItem = await CartItem.findOne({
      where: { 
        cart_item_id: cartItemId 
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const userCart = await Cart.findOne({
      where: { 
        cart_id: cartItem.cart_id,
        user_id: req.user.id 
      }
    });

    if (!userCart) {
      return res.status(403).json({
        success: false,
        message: 'Cart item does not belong to your cart'
      });
    }

    const service = await MsServices.findByPk(serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    console.log('🔍 Service found:', service.name);

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

    let totalPrice = 0;
    const totalGuests = cartItem.adults + cartItem.children;
    
    if (service.unit === 'per_booking') {
      totalPrice = parseFloat(service.service_price) * quantity;
    } else if (service.unit === 'per_person') {
      totalPrice = parseFloat(service.service_price) * totalGuests * quantity;
    }

    console.log('💰 Price calculation:', {
      unit: service.unit,
      servicePrice: service.service_price,
      totalGuests,
      quantity,
      totalPrice
    });

    const cartItemService = await CartItemService.create({
      cart_item_id: cartItemId,
      service_id: serviceId,
      quantity: quantity,
      total_price: totalPrice
    });

    console.log('✅ CartItemService created:', {
      id: cartItemService.cart_item_service_id,
      cart_item_id: cartItemService.cart_item_id,
      service_id: cartItemService.service_id
    });

    await updateCartItemTotalPrice(cartItemId);

    const updatedService = await CartItemService.findOne({
      where: { cart_item_service_id: cartItemService.cart_item_service_id },
      include: [{
        model: MsServices,
        as: 'service',
        attributes: ['id_service', 'name', 'desc', 'service_price', 'unit']
      }]
    });

    const responseData = {
      success: true,
      message: 'Service added successfully',
      service: {
        id: updatedService.cart_item_service_id,
        cart_item_service_id: updatedService.cart_item_service_id,
        service_id: updatedService.service_id,
        service: {
          id_service: updatedService.service.id_service,
          name: updatedService.service.name,
          desc: updatedService.service.desc,
          service_price: updatedService.service.service_price,
          price: updatedService.service.service_price,
          unit: updatedService.service.unit
        },
        quantity: updatedService.quantity,
        totalPrice: updatedService.total_price,
        total_price: updatedService.total_price
      }
    };

    console.log('📦 Response ready:', responseData);

    res.json(responseData);

  } catch (error) {
    console.error('❌ Add service error:', error);
    console.error('❌ Error details:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to add service: ' + error.message
    });
  }
};

export const removeServiceFromCartItem = async (req, res) => {
  try {
    const { cartItemServiceId } = req.params;

    console.log('🗑️ Removing service ID:', cartItemServiceId);

    const cartItemService = await CartItemService.findByPk(cartItemServiceId);

    if (!cartItemService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found in cart'
      });
    }

    const cartItem = await CartItem.findByPk(cartItemService.cart_item_id);
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const userCart = await Cart.findOne({
      where: { 
        cart_id: cartItem.cart_id,
        user_id: req.user.id 
      }
    });

    if (!userCart) {
      return res.status(403).json({
        success: false,
        message: 'Service does not belong to your cart'
      });
    }

    const cartItemId = cartItemService.cart_item_id;
    
    await cartItemService.destroy();

    await updateCartItemTotalPrice(cartItemId);

    res.json({
      success: true,
      message: 'Service removed successfully'
    });

  } catch (error) {
    console.error('❌ Remove service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove service: ' + error.message
    });
  }
};

// GET CART 
export const getCart = async (req, res) => {
  try {
    console.log('🛍️ Getting cart for user:', req.user.id);
    
    // Query cart items
    const cartItems = await CartItem.findAll({
      where: { cart_id: req.cart.cart_id },
      order: [['createdAt', 'DESC']]
    });

    console.log('📋 Found cart items:', cartItems.length);

    // Get services untuk setiap cart item
    const cartItemsWithServices = await Promise.all(
      cartItems.map(async (item) => {
        // Query services
        const cartItemServices = await CartItemService.findAll({
          where: { cart_item_id: item.cart_item_id },
          include: [{
            model: MsServices,
            as: 'service'
          }]
        });

        // Format services
        const formattedServices = cartItemServices.map(cis => ({
          id: cis.cart_item_service_id,
          cart_item_service_id: cis.cart_item_service_id,
          service: {
            id_service: cis.service?.id_service,
            name: cis.service?.name,
            desc: cis.service?.desc,
            service_price: cis.service?.service_price,
            price: cis.service?.service_price,
            unit: cis.service?.unit
          },
          quantity: cis.quantity,
          totalPrice: cis.total_price
        }));

        console.log(`🛍️ Cart item ${item.cart_item_id} has ${formattedServices.length} services`);

        // Parse room data
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

        return {
          id: item.cart_item_id,
          cart_item_id: item.cart_item_id,
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
      })
    );

    console.log('✅ Final cart data prepared');

    res.json({
      success: true,
      cart: cartItemsWithServices
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart items'
    });
  }
};

// REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    console.log('🗑️ Removing item:', itemId, 'from cart:', req.cart.cart_id, 'user:', req.user.id);

    // Hapus services terlebih dahulu
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

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    console.log('🧹 Clearing cart:', req.cart.cart_id, 'for user:', req.user.id);
    
    // Hapus semua cart items dan services
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