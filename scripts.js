// Click Event Listeners
const buttons = document.querySelectorAll("button");
buttons.forEach(button => button.addEventListener('click', function (e) {
    handler(e.target.id);
}));

handler(id) {
    switch (id) {
        case "play":
            
            break;

        case "pause":
            break;
        
        case "stop":
            break;
        
        case "reset":
            break;        
    }
}