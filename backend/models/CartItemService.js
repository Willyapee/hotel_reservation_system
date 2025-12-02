import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const CartItemService = db.define('cart_item_services', {
  cart_item_service_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cart_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cart_items',
      key: 'cart_item_id'
    }
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ms_services',
      key: 'id_service'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  freezeTableName: true,
  timestamps: true,
});

export default CartItemService;