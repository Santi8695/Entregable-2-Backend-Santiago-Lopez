import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import http from 'http';
import { Server } from 'socket.io';import PM from './ProductManager/ProductManager.js';
import CM from './CartManager/CartManager.js';

const app = express();
const PORT = 8080;
const server = http.createServer(app);
const socketServer = new Server(server);

const ProductManager = new PM('./products.json');
const CartManager = new CM('./carts.json');


app.use(express.json());


app.engine('handlebars', handlebars.engine()); // Configuramos Handlebars como motor de plantillas
app.set('views', `${__dirname}/views`); // Establecemos la carpeta de vistas
app.set('view engine', 'handlebars'); // Establecemos Handlebars como el motor de plantillas por defecto    

app.use(express.static(`${__dirname}/public`)); // Servimos archivos estáticos desde la carpeta public

app.get('/', (req, res) => {
    res.render('realTimeProducts');
})

app.get('/realtimeproducts', async (req, res) => {
    const productos = await ProductManager.getProducts();
    res.render('realTimeProducts', { productos });
});


const dataDos= 'Sábado 12 de Abril'

socketServer.on('connection', (socket)=>{

    console.log('Nuevo cliente conectado', socket.id);

    // socket.on sirve para escuchar/recibir eventos del cliente y ejecutar una función
    socket.on('message', (data)=>{

        console.log('DATA:', data);

        // socket.emit sirve para enviar un evento al cliente.
        socket.emit('ClientMessage', dataDos, socket.id);

    })

    socket.on('disconnect',()=>{
        console.log('Cliente desconectado', socket.id);
    })

})

app.get('/home', async (req, res) => {
    const productos = await ProductManager.getProducts();
    res.render('home', { productos });
});

// Peticiones para Productos
app.post('/products', async (req, res) => {
    try {
        const newProduct = await ProductManager.addProduct(req.body);
        
        // Emitir productos actualizados
        const productos = await ProductManager.getProducts();
        socketServer.emit('productosActualizados', productos);

        res.status(201).json({ message: 'Producto agregado', product: newProduct });
    } catch (error) {
        res.status(400).json({ error: error.message });
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
        
        const productos = await ProductManager.getProducts();
        socketServer.emit('productosActualizados', productos);

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


// app.listen(PORT, () => {
//     console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });


server.listen(PORT,()=>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
})