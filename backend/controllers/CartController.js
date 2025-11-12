// controllers/cartController.js
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItemm.js';
import Rooms from '../models/Rooms.js'; // Import model Rooms

// Generate unique cart session ID
const generateCartId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Get or create cart session
const getOrCreateCart = async (req) => {
  let cartId = req.session.cartId;
  
  if (!cartId) {
    cartId = generateCartId();
    req.session.cartId = cartId;
    
    // Simpan cart ke database
    const cart = await Cart.create({
      cart_session_id: cartId,
      id_user: req.user?.id || null,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam
    });
    
    return cart;
  }
  
  // Cari cart existing
  const cart = await Cart.findOne({
    where: { cart_session_id: cartId },
    include: [{ model: CartItem, as: 'cart_items' }]
  });
  
  return cart;
};

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, rooms } = req.body;
    
    // Validasi data
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: roomId, checkIn, checkOut'
      });
    }

    // Get or create cart
    const cart = await getOrCreateCart(req);
    
    // Cek apakah room sudah ada di cart
    const existingItem = await CartItem.findOne({
      where: { 
        id_cart: cart.id_cart,
        id_room: roomId,
        check_in_date: checkIn,
        check_out_date: checkOut
      }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Room already in cart for these dates'
      });
    }

    // ✅ AMBIL DATA ROOM - GANTI DENGAN MODEL ROOMS ANDA
    const room = await Rooms.findByPk(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Hitung total nights dan price
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = room.room_price * nights; // Sesuaikan field price

    // Simpan ke cart items
    const cartItem = await CartItem.create({
      id_cart: cart.id_cart,
      id_room: roomId,
      check_in_date: checkIn,
      check_out_date: checkOut,
      adults: guests.totalAdults,
      children: guests.totalChildren,
      child_ages: rooms.flatMap(room => room.childAges),
      room_data: {
        name: room.room_name, // Sesuaikan field
        type: room.room_type, // Sesuaikan field  
        price: room.room_price, // Sesuaikan field
        image: room.room_image, // Sesuaikan field
        description: room.room_description, // Sesuaikan field
        bed_type: room.bed_type // Sesuaikan field
      },
      total_nights: nights,
      total_price: totalPrice
    });

    res.json({
      success: true,
      message: 'Room added to cart successfully',
      cartItem: {
        id: cartItem.id_cart_item,
        room: cartItem.room_data,
        checkIn: cartItem.check_in_date,
        checkOut: cartItem.check_out_date,
        nights: cartItem.total_nights,
        guests: {
          adults: cartItem.adults,
          children: cartItem.children
        },
        totalPrice: cartItem.total_price
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add room to cart'
    });
  }
};

// GET CART ITEMS
export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    
    const cartItems = await CartItem.findAll({
      where: { id_cart: cart.id_cart },
      order: [['createdAt', 'DESC']]
    });

    const formattedCart = cartItems.map(item => ({
      id: item.id_cart_item,
      room: {
        ...item.room_data,
        total: item.total_price
      },
      checkIn: item.check_in_date,
      checkOut: item.check_out_date,
      nights: item.total_nights,
      guests: {
        adults: item.adults,
        children: item.children
      },
      totalPrice: item.total_price
    }));

    res.json({
      success: true,
      cart: formattedCart,
      cartId: cart.cart_session_id
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
    
    const cart = await getOrCreateCart(req);
    
    const deleted = await CartItem.destroy({
      where: { 
        id_cart_item: itemId,
        id_cart: cart.id_cart 
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
    const cart = await getOrCreateCart(req);
    
    await CartItem.destroy({
      where: { id_cart: cart.id_cart }
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