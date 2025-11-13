// controllers/cartController.js
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItemm.js';
import Rooms from '../models/Rooms.js';
import MsRoomType from '../models/msRoomTypes.js';

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
    const totalPrice = roomType.price_per_night * nights;

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
      total_price: totalPrice
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
        totalPrice: cartItem.total_price
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

// GET CART - pakai cart dari middleware
export const getCart = async (req, res) => {
  try {
    console.log('🛍️ Getting cart for user:', req.user.id, 'cart:', req.cart.cart_id);
    
    const cartItems = await CartItem.findAll({
      where: { cart_id: req.cart.cart_id },
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

// TRANSFER FUNCTION - HAPUS, SUDAH TIDAK DIPERLUKAN
// export const transferGuestCartToUser = async (req, res, next) => {
//   // Hapus function ini karena tidak ada guest cart lagi
// };