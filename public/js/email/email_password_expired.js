const button = document.querySelector('.notify-btn');

button.onclick = () => {
        
        var templateParams = {
            /* name: document.getElementById('name').value, */
        };
    
        emailjs.send('service_9bu3nfr', 'template_5qluaw5', templateParams)
        .then(
            res => {
                /* document.getElementById("name").value = "", */
                console.log.apply(res)
            alert("message sent sucessfully");
        })
        .catch((err) => console.log(err));
    
}