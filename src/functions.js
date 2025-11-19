    $("*[data-type=video]").click(function(){
      var title = $(this).closest(".box-inner").find("h5").html();
      var src = $(this).data("src");
      $("#vidModal h5").html(title);
      $("#vidModal iframe").attr("src",src);
      $("#vidModal").modal();
    });
    $("*[data-type=other]").click(function(){
      var title = $(this).closest(".box-inner").find("h5").html();
      var src = $(this).data("src");
      $("#podcastModal h5").html(title);
      $("#podcastModal audio").attr("src",src);
      $("#podcastModal").modal();
    });
    $("*[data-type=book]").click(function(){
      var title = $(this).closest(".box-inner").find("h5").html();
      var src = $(this).data("src");
      $("#bookModal h5").html(title);
      $("#bookModal iframe").attr("src",src);
      $("#bookModal").modal();
    });
    $('.modal').on('hidden.bs.modal', function (e) {
      $(".modal h5").html("");
      $(".modal iframe").attr("src",null);
      $(".modal audio").attr("src",null);
      const audio = document.getElementById('myAudio');
      audio.pause();       // leállítja a lejátszást
      audio.currentTime = 0; // visszaállítja az elejére
    })

    const USERS = [
  {user: "robert.hohol@otpip.hu", hash: "4829518b851dcb66d3aff29be3bb32723bf02eac3df46ac666dbb3e1abf91821"},
  {user: "angela.erzsebet.tamus@otpip.hu",   hash: "4e99155dab6b8c78234d6f24badcca658c0610104e50d8d76ef5c78cf924dae1"},
];
/* ------------------------------------------------------------------------------------------ */

/* SHA-256 hash funkció Web Crypto API-val; visszatér hex stringgel */
async function sha256Hex(message) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/* Ellenőrzés: bejelentkezés feldolgozása */
async function tryLogin(username, password) {
  // normál formázás
  username = (username||"").toString().trim().toLowerCase();
  const passHash = await sha256Hex(password);

  const ok = USERS.some(u => u.user === username && u.hash === passHash);
  if (ok) {
    sessionStorage.setItem('authUser', username);
    return true;
  } else {
    return false;
  }
}

/* kijelentkezés */
function logout() {
  sessionStorage.removeItem('authUser');
  // újra megnyitjuk a modal-t
  $('#whoami').text('');
  $('#protected-content').hide();
  $('#loginErr').addClass('d-none');
  $('#loginModal').modal('show');
}

/* checkAuth - meghívandó minden oldal load végén */
function checkAuth() {
  const user = sessionStorage.getItem('authUser');
  if (user) {
    // belépve: mutatjuk a tartalmat
    $('#whoami').text(user);
    $('#protected-content').show();
    $('#loginModal').modal('hide');
  } else {
    // nincs belépve: mutatjuk a login modal-t
    $('#protected-content').hide();
    $('#loginModal').modal('show');
  }
}

/* ----- inicializálás: form kezelése, logout, és első check ----- */
$(document).ready(function() {
  // form submit
  $('#loginForm').on('submit', async function (e) {
    e.preventDefault();
    const user = $('#loginUser').val();
    const pass = $('#loginPass').val();

    const ok = await tryLogin(user, pass);
    if (ok) {
      $('#loginErr').addClass('d-none');
      $('#loginUser').val('');
      $('#loginPass').val('');
      checkAuth();
    } else {
      $('#loginErr').removeClass('d-none');
    }
  });

  // logout
  $('#logoutBtn').on('click', function () {
    logout();
  });

  // ha a modal bezárulne (nem ajánlott bezárni), gondoskodunk róla, hogy mindig megjelenjen, ha nincs auth
  $('#loginModal').on('hidden.bs.modal', function () {
    if (!sessionStorage.getItem('authUser')) {
      $('#loginModal').modal('show');
    }
  });

  // első auth check
  checkAuth();
});