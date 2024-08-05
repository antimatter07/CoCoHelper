$(document).ready(function() {

    var isValidPassword = false;
    var isValidEmail = false;
    
    $('#cpassword').keyup(function() {
        var pw = document.getElementById('cpassword');
        const value = pw.value.trim();
        var pwerror = document.getElementById('pwerror');

        if(value.length < 8) {

            pwerror.innerHTML = 'Password must be at least 8 characters.';
            isValidPassword = false;
            

        } else {
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

    $('.input').keyup(function() {
        if(isValidEmail && isValidPassword) {
            $('#nextbutton').prop('disabled', false);

        } else {
            $('#nextbutton').prop('disabled', true);
        }
    });

    // returns true if all questions have answers
    function checkInputs() {
        let allFilled = true;

        $('.q_input').each(function() {
            // console.log("VAL: ["+ $(this).val().trim() +"]")
            if ($(this).val().trim() === '') {
                allFilled = false;
                return false;
            }
        });

        return allFilled;
    }

    // returns true if all questions are unique
    function checkRepeats() {
        let allUnique = true;
        let noEmpty = true;

        let values = [];
        $('.question').each(function() {
            let val = $(this).val();
            if (val === '' || val === null) {
                noEmpty = false;
                return false;
            }
            else if (values.includes(val)) {
                allUnique = false;
                return false;
            }
            values.push(val);
        });

        if (allUnique)
            $("#sqerror").hide();
        else $("#sqerror").show();

        return noEmpty && allUnique;
    }

    $('.question').on('change', function() {
        if (checkRepeats() && checkInputs()){
            $('#registerbutton').prop('disabled', false);

        } else {
            $('#registerbutton').prop('disabled', true);

        }
    })

    $('.q_input').keyup(function() {
        if (checkRepeats() && checkInputs()){
            $('#registerbutton').prop('disabled', false);

        } else {
            $('#registerbutton').prop('disabled', true);
        }
    });

    // these are initially hidden
    $("#returnbutton").hide();
    $("#registerbutton").hide();
    $("#reg2").hide();
    
    // move to security questions
    $("#nextbutton").click(function() {
        
        $("#nextbutton").hide();
        $("#returnbutton").show();
        $("#registerbutton").show();
        $("#reg1").hide();
        $("#reg2").show();
        $("#regpart").text("2 out of 2");
    });

    // return to account details
    $("#returnbutton").click(function() {
        $("#nextbutton").show();
        $("#returnbutton").hide();
        $("#registerbutton").hide();
        $("#reg1").show();
        $("#reg2").hide();
        $("#regpart").text("1 out of 2");
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