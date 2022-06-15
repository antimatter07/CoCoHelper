$(document).ready(function() {
    var inside = false;

    var validemail = "guestemail@gmail.com";
    var validpassword = "pass123";

    function checkValidFields() {

        var valid = false;
        var pass = document.getElementById("pinput").value;
        var email = document.getElementById("emailinput").value;

        if(pass == validpassword && email == validemail) {
            valid = true;
            alert("Log in succesful!");


        } else {
            
            alert("Invalid log in. Please try again.");

            $("#pinput").css("background-color", "red");
            $("#emailinput").css("background-color", "red");

        }

        return valid;





    }

    $( "#login" ).submit(function( event ) {

        var valid;
        valid = checkValidFields();
        return valid;
        
      });


    
    /*$( "#sub" ).on({
        mouseenter: function() {
          $(this).css("border-width", "10px");
        },

        mouseleave: function() {

            $(this).css("border-width", "1px");

        }
    })
    */

    $("#loginhead").fadeIn();


});