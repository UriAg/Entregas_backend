export const argsProductError = product =>{
    let { title, description, price, code, stock, category } = product
    return `One or more properties were incomplete or not valid.
        List of required properties:
        * Title: needs to be a String, received '${title}' (${typeof title})
        * Description: needs to be a String, received '${description}' (${typeof description})
        * Price: needs to be a Number, received '${price}' (${typeof price})
        * Code: needs to be a String, received '${code}' (${typeof code})
        * Stock: needs to be a Number, received '${stock}' (${typeof stock})
        * Category: needs to be a String, received '${category}' (${typeof category})`
}

export const invalidIdProductError = id =>{
    return `Invalid id (${id}). expected value type: 65616ccc6214a1d12b758db7`
}

export const IdNotFoundProductError = id =>{
    return `Id (${id}) is not referenced to any product.`
}