const selectBtn = document.getElementById("select-btn")
const text = document.getElementById("text")
const options = document.getElementsByClassName("option")

selectBtn.addEventListener("click", function() {
    selectBtn.classList.toggle("active")
})
for (option of options) {
    console.log(options)
    option.onclick = function() {
        text.innerHTML = this.textContent
    }
}
