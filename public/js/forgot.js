$(document).ready(function() {

    var isValidNumber = false;
    var pnumber;

    // these are initially hidden
    $("#fp2").hide();
    $("#fp3").hide();



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





    // move to security questions
    $("#findnumber").click(function() {
        pnumber = $("#pnumber").val();
  
        $.ajax({
            url: '/findquestions',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ pnumber: pnumber }),
            success: function(response) {
                if (response.message === "VALID") {
                    $("#fp1").hide();
                    $("#fp2").show();
                    $("#fpheader").text("Answer the three security questions below to verify your identity.");
                    
                    q_nums = response.questions.map(item => item.q_num)
                    let questions = response.questions.map(item => item.question)
                    $("#question1").text(questions[0])
                    $("#question2").text(questions[1])
                    $("#question3").text(questions[2])
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


    $('.q_input').keyup(function() {
        let allFilled = true;

        $("#qerror").hide();
        $('.q_input').each(function() {
            let val = $(this).val();
            if (val === '' || val === null) {
                allFilled = false;
                return false;
            }
        });

        if (allFilled)
            $('#verify').prop('disabled', false);
        else $('#verify').prop('disabled', true);

    });

    
    // verify security questions
    $("#verify").click(function() {
        
        let answer1 = $("#answer1").val().toLowerCase().replace(" ","") 
        let answer2 = $("#answer2").val().toLowerCase().replace(" ","") 
        let answer3 = $("#answer3").val().toLowerCase().replace(" ","") 

        $.ajax({
            url: '/verifyanswers',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ pnumber: pnumber }),
            success: function(response) {
                if (response.message === "VALID") {
                    let res1 = response.answers[0].toLowerCase().replace(" ","") 
                    let res2 = response.answers[1].toLowerCase().replace(" ","") 
                    let res3 = response.answers[2].toLowerCase().replace(" ","") 
                    
                    if (answer1 === res1 && answer2 === res2 && answer3 === res3) {
                        $("#fp2").hide();
                        $("#fp3").show();
                        $("#fpheader").text("Account verified. Please enter your new password.");
                    } else $("#qerror").show();
                }
                else {
                    $("#qerror").show();
                }
            },
            error: function(xhr) {
                qerror.innerHTML = 'Invalid inputs.';
            }
        });
    })
    

    $('#npassword').keyup(function() {
        var pass = document.getElementById('npassword');
        const value = pass.value.trim();
        var nperror = document.getElementById('nperror');

        var regex = /^([^A-Z]*|[^a-z]*|[^-!@? .,]*|[^0-9]*)$/; // anything that matches this is invalid  

        if(regex.test(value) || value.length < 8) {
            nperror.innerHTML = 'Password must be at least 8 characters and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
            $("#confirmnew").prop('disabled', true)

        } 
        else {
            nperror.innerHTML = '';
            $("#confirmnew").prop('disabled', false)
        }


        $.ajax({
            url: '/verifypassword',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ pnumber: pnumber, pass: pass }),
            success: function(response) {
                if (response) {
                    
                    // TODO: change password (submit)
                }
                else {
                    event.preventDefault();
                    nperror.innerHTML = 'Password must be different from old password.';
                }
            },
            error: function(xhr) {
                qerror.innerHTML = 'Invalid inputs.';
            }
        });
    })

   
    

});