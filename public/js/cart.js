const cartContainer = document.getElementById('cart-container');
const avatar = document.getElementById('avatar');
const mail = document.getElementById('mail');
const namee = document.getElementById('name');
const address = document.getElementById('address');
const age = document.getElementById('age');
const tel = document.getElementById('tel');
const cartPrice = document.getElementById('cart-price');


async function getDataCart () {
    const data = await fetch('/get-user');
    let j = await data.json();
    return j.cart
}

async function getDataUser () {
    const data = await fetch('/get-user');
    return await data.json();
}

function start () {
    getDataUser()
    .then(d => {
        mail.innerText = 'Email: ' + d.username;
        namee.innerText = 'Name: ' + d.name;
        address.innerText = 'Address: ' + d.address;
        age.innerText = 'Age: ' + d.age;
        tel.innerText = 'Number: ' + d.tel;
    })

    getDataCart()
    .then(d => {
        let p = 0

        d.map(el => {
            p += el.price
            let div = document.createElement('div');
                div.innerHTML = `
                <li class="flex py-6">
                    <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img src=${el.img} alt="Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch." class="h-full w-full object-cover object-center">
                    </div>

                    <div class="ml-4 flex flex-1 flex-col">
                        <form action="/cartRemove" method="post">
                            <div>
                                <div class="flex justify-between text-base font-medium text-gray-900">
                                <h3>
                                    <input class="hidden" class="products-name" name="id" type="text" value=${el._id}>
                                        ${el.name}
                                    </input>
                                </h3>
                                <p class="ml-4">${el.price}$</p>
                                </div>
                            </div>
                            <div class="flex flex-1 items-end justify-between text-sm">
                                <p class="text-gray-500">Qty 1</p>

                                <div class="flex">
                                <button type="submit" class="font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </li>
                `;
            cartContainer.appendChild(div)
        })

        cartPrice.innerText = 'Cart price: ' + p + '$';
    }).catch(err => console.log(err))
}

start()

