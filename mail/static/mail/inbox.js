document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


// sending an email composition
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('table').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

} 

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('table').style.display = '';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  var table = document.querySelector('tbody');
  table.replaceChildren();

  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    
  // Fetching the mail for mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Print emails
    emails.forEach(DisplayEmails);
    });
  }

function DisplayEmails(item){
  
  //searching for table
  var table = document.querySelector('tbody');
  // somehow clear the tbody of the table here ?????
  // table.replaceChildren();
  // adding a row
  var row = table.insertRow(0);
  // adding 3 cells to the row
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);

  cell1.innerHTML = item.sender;
  cell2.innerHTML = item.subject;
  cell3.innerHTML = item.timestamp;

  if (!item.read){
    row.style = "background-color: lightgrey";
  }

  
  // adding a event handler to listen to which email is clicked! :) 
  cell1.addEventListener('click', function(){
    view_email(item);
  })
  cell2.addEventListener('click', function(){
    view_email(item);
  })
  cell3.addEventListener('click', function(){
    view_email(item);
  })
  
}

function view_email(item){
  fetch(`/emails/${item.id}`,{
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })

  })

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('table').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = '';


  document.querySelector('#from').innerHTML = "<strong>From: </strong>" + item.sender;
  document.querySelector('#to').innerHTML = "<strong>To: </strong>"+ item.recipients;
  document.querySelector('#subject').innerHTML = "<strong>Subject: </strong>"+ item.subject;
  document.querySelector('#time').innerHTML = "<strong>Timestamp: </strong>" + item.timestamp;
  document.querySelector('#body').innerHTML = item.body;


  document.querySelector('#reply').addEventListener('click', () => reply_email(item));
}

function reply_email(item){

  compose_email();
  document.querySelector('#compose-recipients').value = item.sender;
  // must at some point check if the email already has Re: as subject line!
  
  if (item.subject.includes('Re: ')){
    document.querySelector('#compose-subject').value = item.subject;
  }
  else{
    document.querySelector('#compose-subject').value = 'Re: ' + item.subject;
  }
  document.querySelector('#compose-body').value = `On ${item.timestamp} ${item.sender} wrote: ` + item.body;
  
}


// Even listener waiting for submission of compose form 
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#compose-form').onsubmit = function () {

    // accessing form input from user
    const form_recipient = document.querySelector('#compose-recipients').value;
    const form_subject = document.querySelector('#compose-subject').value;
    const form_body = document.querySelector('#compose-body').value;
    
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients:`${form_recipient}`,
        subject:`${form_subject}`,
        body:`${form_body}`
      })
    })

    .then(response => response.json())
    .then(result => {
        // Print result

        if (result.error){
          document.querySelector('.error').innerHTML = result.error;
        }
        
        else{
          load_mailbox('sent');
        }
    });
    // prevent default submission
    return false;
  }
});