const productContainer = document.getElementById('product-container');

async function getData () {
    const data = await fetch('/get-products');
    return await data.json();
}

function start () {
    getData()
    .then(d => {
        d.map(el => {
            const div = document.createElement('div');
            div.innerHTML = `
            <div class="group relative">
              <div class="min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:aspect-none lg:h-80">
                <img src=${el.img} alt="sneakers" class="h-full w-full object-cover object-center lg:h-full lg:w-full">
              </div>
              <form action="/cartAdd" method="post">
              <div class="mt-4 flex justify-between">
                <div>
                  <h3 class="text-sm text-gray-700">
                    <input class="hidden" class="products-name" name="id" type="text" value=${el._id}>
                      ${el.name}
                    </input>
                  </h3>
                </div>
                <p class="text-sm font-medium text-gray-900 products-price">${el.price}$</p>
              </div>
              <div class="flex justify-start mt-2">
                <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-sm cursor-pointer text-white py-1 px-2 rounded z-50">
                  Add to the cart
                </button>
              </form>
              </div>
            </div>
            `;
            productContainer.appendChild(div);
        })
    })
    .catch(err => {
        console.log(err)
    })
}

start();
