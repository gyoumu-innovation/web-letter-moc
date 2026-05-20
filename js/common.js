// ユーザードロップダウンの開閉
const userTrigger = document.getElementById('userTrigger');
const userDropdown = document.getElementById('userDropdown');

if (userTrigger && userDropdown) {
  userTrigger.addEventListener('click', function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle('open');
  });

  document.addEventListener('click', function () {
    userDropdown.classList.remove('open');
  });
}

// パスワード表示トグル
document.querySelectorAll('.toggle-password').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const input = this.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      this.textContent = '🙈';
    } else {
      input.type = 'password';
      this.textContent = '👁';
    }
  });
});
