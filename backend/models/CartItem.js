import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const CartItem = db.define('cart_item', {
  cart_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cart_id: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  room_id: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  check_in: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  check_out: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  adults: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  children: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  child_ages: {
    type: DataTypes.JSON,
  },
  room_data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  nights: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  tableName: 'cart_items',
  timestamps: true,
});

export default CartItem;