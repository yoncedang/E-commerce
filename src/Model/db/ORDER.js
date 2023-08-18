import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ORDER extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    order_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    shipping_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'shipping',
        key: 'shipping_id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending','processing','completed','cancelled'),
      allowNull: false,
      defaultValue: "pending"
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'payment_methods',
        key: 'payment_id'
      }
    }
  }, {
    sequelize,
    tableName: 'ORDER',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "order_id" },
        ]
      },
      {
        name: "shipping_id",
        using: "BTREE",
        fields: [
          { name: "shipping_id" },
        ]
      },
      {
        name: "payment_id",
        using: "BTREE",
        fields: [
          { name: "payment_id" },
        ]
      },
    ]
  });
  }
}
