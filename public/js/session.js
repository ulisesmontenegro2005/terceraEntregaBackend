async function getData () {
    const data = await fetch('/get-user');
    return await data.json();
}

async function logout() {
    getData()
    .then(data => {
        Swal.fire({
            icon: 'success',
            title: `Succesful logout ${data.name}`,
            showConfirmButton: false,
            timer: 2000
          });
    }).catch(err=>console.log(err))
  
    setInterval(() => {
        window.location.href = '/logout';
    }, 2000);
}