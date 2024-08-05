$(document).ready(function() {

    var isValidPassword = false;
    var isValidNumber = false;
    
    // $('#cpassword').keyup(function() {
    //     var pass = document.getElementById('cpassword');
    //     const value = pass.value.trim();
    //     var pwerror = document.getElementById('pwerror');

    //     var regex = /^([^A-Z]*|[^a-z]*|[^-!@? .,]*|[^0-9]*)$/; // anything that matches this is invalid  

    //     if(regex.test(value) || value.length < 8) {

    //         pwerror.innerHTML = 'Password must be at least 8 characters and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
    //         isValidPassword = false;
            

    //     } 
    //     else {
    //         pwerror.innerHTML = '';
        
    //         isValidPassword = true;

    //     }

    // })



    $('#pnumber').keyup(function() {
        var num = document.getElementById('pnumber');
        const numval = num.value.trim();
        var pnerror = document.getElementById('pnerror');

        //regex for phone number
        if(/^(639|09)\d{9}$/.test(numval)) {
            pnerror.innerHTML = '';
            isValidNumber = true;
            
        } else {

            pnerror.innerHTML = 'Please enter a valid cellphone number.';
            isValidNumber = false;
            
        }

        if(isValidNumber) {
            $('#findnumber').prop('disabled', false);
        } else {
            $('#findnumber').prop('disabled', true);
        }
    });



    // these are initially hidden
    $("#fp2").hide();
    
    // move to security questions
    $("#findnumber").click(function() {
        let pnumber = $("#pnumber").val();
  
        $.ajax({
            url: '/findcustomer',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ pnumber: pnumber }),
            success: function(response) {
                if (response.message === "VALID") {
                    $("#fp1").hide();
                    $("#fp2").show();
                    $("#fpheader").text("Answer the three security questions below to verify your identity.");
                }
                else {
                    pnerror.innerHTML = 'Please enter a valid cellphone number.';
                }
            },
            error: function(xhr) {
                pnerror.innerHTML = 'Please enter a valid cellphone number.';
            }
        });
        
    });

    // // return to account details
    // $("#returnbutton").click(function() {
    //     $("#nextbutton").show();
    //     $("#returnbutton").hide();
    //     $("#registerbutton").hide();
    //     $("#reg1").show();
    //     $("#reg2").hide();
    //     $("#regpart").text("1 out of 2");
    // });



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