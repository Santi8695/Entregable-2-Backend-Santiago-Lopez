import express from 'express';
import PM from './ProductManager/ProductManager.js';
import CM from './CartManager/CartManager.js';

const app = express();
const PORT = 8080;

const ProductManager = new PM('./products.json');
const CartManager = new CM('./carts.json');


app.use(express.json());

// Peticiones para Productos
app.get('/products', async (req, res) => {
    try {
        const products = await ProductManager.getProducts();
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

app.get('/products/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);

    try {
        const product = await ProductManager.getProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

app.post('/products', async (req, res) => {
    try {
        const newProduct = await ProductManager.addProduct(req.body);
        res.status(201).json({ message: 'Producto agregado', product: newProduct });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/products/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);

    try {
        const updateProduct = await ProductManager.updateProduct(productId, req.body);
        res.json({ message: 'Producto actualizado', product: updateProduct });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.delete('/products/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);

    try {
        await ProductManager.deleteProductById(productId);
        res.json({ message: `Producto con ID "${productId}" eliminado` });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


// Peticiones para Carritos
app.post('/carts', async (req, res) => {
    try {
        const newCart = await CartManager.addCart();
        res.status(201).json({ message: 'Carrito creado', cart: newCart });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

app.get('/carts/:cid', async (req, res) => {
    const cartId = parseInt(req.params.cid);

    try {
        const cart = await CartManager.getCartById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        res.json(cart.products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
});

app.post('/carts/:cid/product/:pid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);

    try {
        const product = await ProductManager.getProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const updatedCart = await CartManager.addProductToCart(cartId, productId);
        res.json({ message: 'Producto agregado al carrito', cart: updatedCart });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto al carrito' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
