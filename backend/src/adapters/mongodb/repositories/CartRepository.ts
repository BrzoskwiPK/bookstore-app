import { Schema, Document, Model, model } from 'mongoose'
import Cart from '../../../domain/cart/models/Cart'
import CartItem from '../../../domain/cart/models/CartItem'
import CartRepositoryInterface from '../../../interfaces/CartRepositoryInterface'

interface ICartDocument extends Cart, Document {
  user: String
}

const cartItemSchema: Schema<CartItem> = new Schema<CartItem>({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
})

const cartSchema: Schema<ICartDocument> = new Schema<ICartDocument>({
  user: { type: String, required: true },
  items: [cartItemSchema],
  totalQuantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
})

export const CartModel: Model<ICartDocument> = model<ICartDocument>(
  'Cart',
  cartSchema,
)

const createCart = async (cartData: Cart): Promise<Cart> => {
  const newCart = await CartModel.create(cartData)
  return newCart
}

const getUserCarts = async (username: string): Promise<Cart[] | null> => {
  const carts = await CartModel.find({ user: username })
    .populate('items.book')
    .lean()

  return carts.map(cart => {
    const populatedItems = cart.items.map(item => ({
      ...item,
      book: item.book,
    }))

    return {
      ...cart,
      items: populatedItems,
    }
  })
}

const getCartById = async (cartId: string): Promise<Cart | null> => {
  const cart = await CartModel.findById(cartId)
  return cart ? { ...cart.toObject() } : null
}

const updateCart = async (
  cartId: string,
  cartData: Cart,
): Promise<Cart | null> => {
  const updatedCart = await CartModel.findByIdAndUpdate(cartId, cartData, {
    new: true,
  })
  return updatedCart ? { ...updatedCart.toObject() } : null
}

const deleteCart = async (cartId: string): Promise<boolean> => {
  const result = await CartModel.findByIdAndDelete(cartId)
  return !!result
}

const addItemToCart = async (
  cartId: string,
  item: CartItem,
): Promise<Cart | null> => {
  const updatedCart = await CartModel.findByIdAndUpdate(
    cartId,
    { $push: { items: item } },
    { new: true },
  )
  return updatedCart ? { ...updatedCart.toObject() } : null
}

const removeItemFromCart = async (
  cartId: string,
  itemId: string,
): Promise<Cart | null> => {
  const updatedCart = await CartModel.findByIdAndUpdate(
    cartId,
    { $pull: { items: { _id: itemId } } },
    { new: true },
  )
  return updatedCart ? { ...updatedCart.toObject() } : null
}

const cartRepository: CartRepositoryInterface = {
  createCart,
  getUserCarts,
  getCartById,
  updateCart,
  deleteCart,
  addItemToCart,
  removeItemFromCart,
}

export default cartRepository
