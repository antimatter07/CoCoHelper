// var regex = new RegExp("^(.{0,7}|[^A-Z]*|[^a-z]*|[^\\W_]*|[^0-9]*)$"); // anything that matches this is invalid


//         var pw_minlen = 8;

//         if (regex.match(pw)) {

//             pwerror.innerHTML = 'Password must contain at least at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.';
//             isValidPassword = false;



//         }

$(document).ready(function() {

    var isValidPassword = false;
    var isValidEmail = false;
    var isValidNumber = false;
    
    $('#cpassword').keyup(function() {
        var pass = document.getElementById('cpassword');
        const value = pass.value.trim();
        var pwerror = document.getElementById('pwerror');

        var regex = /^([^A-Z]*|[^a-z]*|[^-!@? .,]*|[^0-9]*)$/; // anything that matches this is invalid  

        if(regex.test(value) || value.length < 8) {

            pwerror.innerHTML = 'Password must be at least 8 characters and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
            isValidPassword = false;
            

        } 
        else {
            pwerror.innerHTML = '';
        
            isValidPassword = true;

        }

    })

    


    $('#email').keyup(function() {
        var email = document.getElementById('email');
        const emailvalue = email.value.trim();
        var pwerror = document.getElementById('pwerror');

        //regex for email validation
        if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailvalue)) {
            pwerror.innerHTML = '';
            isValidEmail = true;
            
        } else {

            pwerror.innerHTML = 'Please enter a valid email.';
            isValidEmail = false;
            
        }
    });


    $('#pnumber').keyup(function() {
        var num = document.getElementById('pnumber');
        const numval = num.value.trim();
        var pwerror = document.getElementById('pwerror');

        //regex for phone number
        if(/^(639|09)\d{9}$/.test(numval)) {
            pwerror.innerHTML = '';
            isValidNumber = true;
            
        } else {

            pwerror.innerHTML = 'Please enter a valid cellphone number.';
            isValidNumber = false;
            
        }
    });


    $('.input').keyup(function() {
        if(isValidEmail && isValidPassword && isValidNumber) {

            $('#registerbutton').prop('disabled', false);

        } else {
            $('#registerbutton').prop('disabled', true);

        }
    });

    //TODO: server and client side validation with express validator and vanilla JS
    /*Password at least 8 characters, cpassword and password are same,
    no fields are empty, phone number only consists of numbers */
    /*
    var form = document.getElementById('regform');
    var fname = document.getElementById('firstname');
    var lname = document.getElementById('lastname');
    var email = document.getElementById('email');
    var pnumber = document.getElementById('pnumber');
    var pw = document.getElementById('cpassword');

    form.addEventListener('submit', e => {
        e.preventDefault();
        validateInputs();
    });

    const setError = (element, message) => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
        errorDisplay.innerText = message;

        inputControl.classList.add('error');
        inputControl.classList.remove('success');

    };

    const setSuccess = element => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
        
        errorDisplay.innerText = '';
        inputControl.classList.add('success');
        inputControl.classList.remove('error');


    }

    const validateInputs = () => {
        const fnameValue = fname.value.trim();
        const lnameValue = lname.value.trim();
        const emailValue = email.value.trim();
        const pnumberValue = pnumber.value.trim();
        const pwValue = pw.value.trim();

        if(fnameValue === '') {
           var fields = document.getElementsByClassName('.error');
           fields[0].innerHTML = 'ya dum'
        } else {
            setSuccess(fname);
        }
    }
    */
    

    

   
    

});