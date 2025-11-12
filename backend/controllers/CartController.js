// controllers/cartController.js
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItemm.js';
import Rooms from '../models/Rooms.js';
import MsRoomType from '../models/msRoomTypes.js';

// Generate unique cart session ID
const generateCartId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ✅ FIX: GLOBAL CART ID VARIABLE (fallback jika session tidak work)
let globalCartId = null;

// Get or create cart session - ✅ FIX CART CONSISTENCY
const getOrCreateCart = async (req) => {
  let cartId;
  
  // ✅ PRIORITIZE SESSION, THEN GLOBAL, THEN CREATE NEW
  if (req.session?.cartId) {
    cartId = req.session.cartId;
    console.log('📦 Existing session cart:', cartId);
  } else if (globalCartId) {
    cartId = globalCartId;
    console.log('📦 Existing global cart:', cartId);
  } else {
    cartId = generateCartId();
    globalCartId = cartId; // ✅ SET GLOBAL FALLBACK
    if (req.session) {
      req.session.cartId = cartId;
    }
    console.log('🆕 New cart created:', cartId);
  }
  
  // Cari cart di database
  let cart = await Cart.findOne({
    where: { session_id: cartId }
  });
  
  if (!cart) {
    cart = await Cart.create({
      session_id: cartId,
      user_id: req.user?.id || null,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    console.log('📝 Cart created in DB:', cart.cart_id);
  }
  
  return cart;
};

// ADD TO CART - ✅ FIX TIMEZONE ISSUE
export const addToCart = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, rooms } = req.body;
    
    console.log('🛒 Add to cart request:', { roomId, checkIn, checkOut, guests });

    // Validasi data
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // ✅ FIX: CONVERT DATE TO UTC TO AVOID TIMEZONE ISSUES
    const utcCheckIn = new Date(checkIn + 'T00:00:00Z');
    const utcCheckOut = new Date(checkOut + 'T00:00:00Z');
    
    console.log('📅 Date conversion:', {
      original: { checkIn, checkOut },
      utc: { utcCheckIn, utcCheckOut }
    });

    // Get or create cart
    const cart = await getOrCreateCart(req);
    console.log('📦 Cart ID:', cart.cart_id);
    
    // Cek duplikat - ✅ GUNAKAN UTC DATES
    const existingItem = await CartItem.findOne({
      where: { 
        cart_id: cart.cart_id,
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

    // Ambil data room & room type
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

    // Hitung harga - ✅ GUNAKAN UTC DATES
    const nights = Math.ceil((utcCheckOut - utcCheckIn) / (1000 * 60 * 60 * 24));
    const totalPrice = roomType.price_per_night * nights;

    console.log('💰 Price calculation:', { 
      nights, 
      roomPrice: roomType.price_per_night, 
      totalPrice,
      roomName: roomType.name
    });

    // Simpan ke cart - ✅ GUNAKAN UTC DATES
    const cartItem = await CartItem.create({
      cart_id: cart.cart_id,
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

    console.log('✅ Cart item created successfully, ID:', cartItem.cart_item_id);
    console.log('💾 Saved to database with cart_id:', cart.cart_id);

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
      },
      cartId: cart.session_id // ✅ KIRIM CART ID KE CLIENT
    });

  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add room to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET CART ITEMS - ✅ FIX: ENSURE room_data IS PROPERLY PARSED AND SENT
export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    console.log('🛍️ Getting cart items for cart ID:', cart.cart_id);
    
    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.cart_id },
      order: [['createdAt', 'DESC']]
    });

    console.log('📋 Found cart items:', cartItems.length);
    
    // ✅ FIX: PROPERLY HANDLE room_data PARSING
    const formattedCart = cartItems.map(item => {
      console.log('🛒 Processing cart item:', {
        id: item.cart_item_id,
        room_data: item.room_data,
        room_data_type: typeof item.room_data
      });

      // ✅ FIX: PARSE room_data DENGAN BENAR
      let roomData = {};
      try {
        // Handle both string JSON and object
        if (typeof item.room_data === 'string') {
          roomData = JSON.parse(item.room_data);
          console.log('✅ Successfully parsed room_data string');
        } else if (typeof item.room_data === 'object') {
          roomData = item.room_data;
          console.log('✅ room_data is already object');
        }
      } catch (error) {
        console.error('❌ Error parsing room_data:', error);
        // Fallback room data
        roomData = {
          name: "Room",
          price: 0,
          image: "/default-room.jpg",
          description: "Room description",
          bed_type: "No bed information",
          room_number: "-"
        };
      }

      // ✅ FIX: ENSURE ALL REQUIRED FIELDS EXIST
      const finalRoomData = {
        name: roomData.name || "Room",
        type: roomData.type || roomData.name || "Standard Room",
        price: roomData.price || roomData.price_per_night || 0,
        image: roomData.image || roomData.image_url || "/default-room.jpg",
        description: roomData.description || "Room description",
        bed_type: roomData.bed_type || roomData.room_bed || "No bed information",
        capacity: roomData.capacity || 2,
        room_number: roomData.room_number || "-"
      };

      console.log('🎯 Final room data for frontend:', finalRoomData);

      return {
        id: item.cart_item_id,
        // ✅ SEND BOTH room AND room_data FOR COMPATIBILITY
        room: finalRoomData,
        room_data: finalRoomData,
        checkIn: item.check_in,
        checkOut: item.check_out,
        nights: item.nights,
        adults: item.adults, // ✅ DIRECT PROPERTIES
        children: item.children, // ✅ DIRECT PROPERTIES
        guests: {
          adults: item.adults,
          children: item.children
        },
        totalPrice: item.total_price
      };
    });

    console.log('📦 Sending formatted cart to frontend:', formattedCart.length, 'items');

    res.json({
      success: true,
      cart: formattedCart,
      cartId: cart.session_id
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
        cart_item_id: itemId,
        cart_id: cart.cart_id
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
      where: { cart_id: cart.cart_id }
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