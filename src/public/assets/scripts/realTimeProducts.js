const socket=io()

document.getElementById('deleteProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = document.getElementById('productIdToDelete').value;

    try {
        await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
        })

    } catch (error) {
        console.error('Error al enviar la solicitud DELETE:', error);
    }
});

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const productData = {
        
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        thumbnail: formData.get('thumbnail'),
        code: formData.get('code'),
        stock: parseInt(formData.get('stock')),
        category: formData.get('category')
    };

    try {
        await fetch('/api/products/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        })
    } catch (error) {
        console.error('Error al enviar la solicitud POST:', error);
    }
});

socket.on('productListUpdate', (products) => {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    products.forEach((product) => {
        const li = document.createElement('li');
        li.innerHTML = `<b>ID:</b> ${product._id}, <b>Título:</b> ${product.title}, <b>Descripción:</b> ${product.description}`;
        productList.appendChild(li);
    });
});


socket.on('newProduct',( newProduct , products)=>{
    console.log(`Se ha dado de alta: ${newProduct.title}`)

    let productContainer = document.querySelector('.products-container');
    productContainer.innerHTML = ''
    products.forEach(product => {
       
        productContainer.insertAdjacentHTML('afterbegin', `
        <div class="product-item" onclick=showDetails('${product._id}')>
            <p><b>Id:</b> ${product._id}</p>
            <p><b>Product: </b>${product.title}</p>
            <p><b>Category:</b> ${product.category}</p>
            <p><b>Price:</b> ${product.price}</p>
        </div>
    `)
    });

})


socket.on('productDeleted', ({ productId }) => {
    
    const productElement = document.getElementById(productId);
    productElement.remove();
    console.log(`Producto eliminado: ${productId}`);

});

function showDetails(id){
    let url = "/products/"+id;
    window.location = url
}