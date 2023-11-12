/* for journal entry */
const button = document.querySelector('.journal-btn');

button.onclick = () => {
        
        var templateParams = {
            name: document.getElementById('name').value,
        };
    
        emailjs.send('service_9bu3nfr', 'template_fqcnfto', templateParams)
        .then(
            res => {
                document.getElementById("name").value = "",
                console.log.apply(res)
            alert("message sent sucessfully");
        })
        .catch((err) => console.log(err));
    
}

/* for adj journal entry */
const button2 = document.querySelector('.adjust-btn');

button2.onclick = () => {
        
        var templateParams = {
            name: document.getElementById('name2').value,
        };
    
        emailjs.send('service_9bu3nfr', 'template_e9qtgt3', templateParams)
        .then(
            res => {
                document.getElementById("name2").value = "",
                console.log.apply(res)
            alert("message sent sucessfully");
        })
        .catch((err) => console.log(err));
    
}