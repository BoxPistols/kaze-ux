/*
document.addEventListener('DOMContentLoaded', () => {
  const password = import.meta.env.VITE_APP_PASSWORD

  function authenticateUser() {
    const userInput = prompt('パスワードを入力してください:')
    if (userInput === password) {
      document.body.style.opacity = '1'
      document.body.style.pointerEvents = 'auto'
    } else if (userInput === null) {
      window.location.href = 'about:blank'
    } else {
      alert('パスワードが正しくありません。再度お試しください。')
      authenticateUser()
    }
  }

  document.body.style.opacity = '0'
  document.body.style.pointerEvents = 'none'
  authenticateUser()
})
*/
