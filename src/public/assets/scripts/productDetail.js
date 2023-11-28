async function addToCart(ProductId, Quantity){
    await fetch(`/api/carts/${ProductId}/${Quantity}`, {
        method: 'POST',
        headers: {
            'Accept':'application/json',
        },
    });
}