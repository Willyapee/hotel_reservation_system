import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Cart = db.define('cart', {
  cart_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  session_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  tableName: 'carts', // ✅ explicit table name
  timestamps: true,
});

export default Cart;