/*
//set display name to form submission, set welcome banner to display name
document.getElementById("user_id_submit").addEventListener("user_id_submit", function(){
    var user_id = document.getElementById("user_id").value;
        document.getElementById("welcome_banner").innerHTML = user_id
            localStorage.setItem('user_id', JSON.stringify(user_id));
            document.getElementById("welcome_banner").innerHTML = getWelcomeBanner();
     });

            function getWelcomeBanner(){
                var retrieve=localStorage.getItem('user_id');
                return JSON.parse(retrieve); //Now return the value
            }
*/

