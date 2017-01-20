// ====================================
// KDX MENU [fixed layout menu]
// ====================================

$('body').append('<div class="kdx-nav" >' +
    '<div class="kdx-nav__trigger">Kdx Menu</div>' +
        '<div class="kdx-nav__body clearfix">' +
            '<a href="/">главная</a>' +
            '<h4>Системные страницы</h4>' +
            '<a href="/masterpage.html">мастерпейдж</a>' +
            '<hr>' +
        '</div>' +
    '</div>');

// CLOSE / OPEN
function kdxMenuOpen(){
    $('.kdx-nav').toggleClass('kdx-nav--opened').find('.kdx-nav__body').slideToggle();
}
$(document).on('click','.kdx-nav__trigger',function(){
    kdxMenuOpen();
    return false;
});
// Uncomment this to show kdx_nav on page load
// Comment this to hide kdx_nav on page load
// kdxMenuOpen();


// ====================================
// /KDX MENU [fixed layout menu]
// ====================================


// ====================================
// HREF # KILLER
// ====================================
$(document).on('click','[href="#"]',function(e){
    e.preventDefault()
});
// ====================================
// /HREF#KILLER
// ====================================

// Подсветка кода на мастерпейдже
hljs.initHighlightingOnLoad();