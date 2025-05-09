import fs from 'fs';

class CartManager {
    constructor(path) {
        this.path = path;
    }

  async getCarts() {
    try {
      if (!fs.existsSync(this.path)) return [];

      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al leer carritos:', error);
      return [];
    }
  }

  async addCart() {
    const carts = await this.getCarts();

    const id = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
    const newCart = { id, products: [] };

    carts.push(newCart);

    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));

    return newCart;
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(cart => cart.id === id) || null;
  }

  async addProductToCart(cartId, productId) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex(cart => cart.id === cartId);

    if (cartIndex === -1) {
      throw new Error(`El carrito con ID ${cartId} no existe`);
    }

    const existingProduct = carts[cartIndex].products.find(p => p.product === productId);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      carts[cartIndex].products.push({ product: productId, quantity: 1 });
    }

    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));

    return carts[cartIndex];
  }
}

export default CartManager;
