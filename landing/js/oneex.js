/*
  [JS Index]
  
  ---
  
  Template Name: Oneex - Virtual Business Card
  Author:  ex-nihilo
  Version: 1.2
*/


/*
  1. preloader
  2. navigation
    2.1. navigation launcher
	2.2. navigation OPEN/CLOSE
  3. animate elements
  4. facts counter
  5. owl carousel
    5.1. testimonials carousel
	5.2. works carousel
    5.3. news carousel
  6. chart skills
  7. skills bar
  8. magnificPopup
  9. clone function
  10. YouTube player
  11. contact form
    11.1. contact modal
*/


$(function() {
    "use strict";
	
	
    // 1. preloader
    $("#preloader").fadeOut(1000);
    $(".preloader-bg").delay(800).fadeOut(1000);
	
    // 2. navigation
    $(".page-scroll").on("click", function(e) {
        var $anchor = $(this);
        $("html, body").stop().animate({
            scrollTop: $($anchor.attr("href")).offset().top - 0
        }, 1500, 'easeInOutExpo');
        e.preventDefault();
    });
    // 2.1. navigation launcher
    $(".navigation-fire").on("click", function() {
        if ($(".introduction").hasClass("introduction-off")) {
            $(".introduction").removeClass("introduction-off").addClass("introduction-on");
            $("nav.navigation-menu").removeClass("show");
        } else {
            $(".introduction").removeClass("introduction-on").addClass("introduction-off");
            $("nav.navigation-menu").addClass("show");
        }
    });
    // 2.2. navigation OPEN/CLOSE
    $("nav.navigation-menu a").on("click", function() {
        if ($("nav.navigation-menu").hasClass("show")) {
            $("nav.navigation-menu").removeClass("show");
            $(".introduction").removeClass("introduction-off").addClass("introduction-on");
        } else {
            $("nav.navigation-menu").addClass("show");
        }
    });
	
    $(window).on("scroll", function() {
        // 3. animate elements
        if ($(this).scrollTop() > 50) {
            $(".to-top-arrow").addClass("show");
			$(".round-menu").addClass("direction");
			$(".round-menu").addClass("round-menu-no-bg");
			$(".logo, .vertical-lines-wrapper, .vertical-lines-wrapper-e, .vertical-lines-wrapper-e-2").addClass("off");
        } else {
            $(".to-top-arrow").removeClass("show");
			$(".round-menu").removeClass("direction");
			$(".round-menu").removeClass("round-menu-no-bg");
			$(".logo, .vertical-lines-wrapper, .vertical-lines-wrapper-e, .vertical-lines-wrapper-e-2").removeClass("off");
        }
    });
	
    // 4. facts counter
    $(".facts-counter-number, .facts-counter-number-years").appear(function() {
        var count = $(this);
        count.countTo({
            from: 0,
            to: count.html(),
            speed: 1200,
            refreshInterval: 60
        });
    });
	
    // 5. owl carousel
    // 5.1. testimonials carousel
    $("#owl-carousel-testimonials").owlCarousel({
        loop: true,
        center: true,
        items: 1,
        margin: 0,
        autoplay: true,
        autoplaySpeed: 1000,
        autoplayTimeout: 4000,
        smartSpeed: 450,
        nav: false,
        animateOut: "fadeOut",
        animateIn: "fadeIn"
    });
	// 5.2. works carousel
    $("#owl-carousel-works").owlCarousel({
        loop: false,
        center: false,
        autoplay: false,
        autoplaySpeed: 1000,
        autoplayTimeout: 5000,
        smartSpeed: 450,
        nav: false,
        nav: true,
        navText: ["<i class='ion-chevron-left'></i>", "<i class='ion-chevron-right'></i>"],
        navContainer: '.owl-nav-custom-works',
		items: 1,
		margin: 0
    });
    // 5.3. news carousel
    $("#owl-carousel-news").owlCarousel({
        loop: false,
        center: false,
        autoplay: false,
        autoplaySpeed: 1000,
        autoplayTimeout: 5000,
        smartSpeed: 450,
        nav: false,
        nav: true,
        navText: ["<i class='ion-chevron-left'></i>", "<i class='ion-chevron-right'></i>"],
        navContainer: '.owl-nav-custom-news',
		items: 1,
		margin: 0
    });
	
    // 6. chart skills
    $(".chart-appear-skills").appear(function() {
        $(".chart-skills").easyPieChart({
            easing: "easeOutBounce",
            onStep: function(from, to, percent) {
                $(this.el).find(".percent-skills").text(Math.round(percent));
            }
        });
    });
	
    // 7. skills bar
    $(".show-skillbar").appear(function() {
        $(".skillbar").skillBars({
            from: 0,
            speed: 4000,
            interval: 100,
            decimals: 0
        });
    });
	
    // 8. magnificPopup
    $(".popup-photo").magnificPopup({
        type: "image",
        gallery: {
            enabled: false,
            tPrev: "",
            tNext: "",
            tCounter: "%curr% / %total%"
        },
        removalDelay: 100,
        mainClass: "mfp-fade",
        fixedContentPos: false
    });
	$(".popup-photo-gallery").each(function() {
        $(this).magnificPopup({
            delegate: "a",
            type: "image",
            gallery: {
                enabled: true
            },
            removalDelay: 100,
            mainClass: "mfp-fade",
            fixedContentPos: false
        });
    });
	
	// 9. clone function
    $.fn.duplicate = function(count, cloneEvents, callback) {
        var stack = [],
            el;
        while (count--) {
            el = this.clone(cloneEvents);
            callback && callback.call(el);
            stack.push(el.get()[0]);
        }
        return this.pushStack(stack);
    };
    $("<div class='vertical-lines-wrapper'></div>").appendTo(".vertical-lines");
    $("<div class='vertical-effect'></div>").duplicate(3).appendTo(".vertical-lines-wrapper");
    $("<div class='vertical-lines-wrapper'></div>").appendTo(".vertical-lines");
    $("<div class='vertical-effect-2'></div>").duplicate(3).appendTo(".vertical-lines-wrapper");
	$("<div class='vertical-lines-wrapper-e'></div>").appendTo(".vertical-lines-e");
    $("<div class='vertical-effect-e'></div>").duplicate(3).appendTo(".vertical-lines-wrapper-e");
    $("<div class='vertical-lines-wrapper-e-2'></div>").appendTo(".vertical-lines-e");
    $("<div class='vertical-effect-2-e'></div>").duplicate(3).appendTo(".vertical-lines-wrapper-e-2");
	
	// 10. YouTube player
    $("#bgndVideo").YTPlayer();
	
	// 11. contact form
    $("form#form").on("submit", function() {
        $("form#form .error").remove();
        var s = !1;
        if ($(".requiredField").each(function() {
                if ("" === jQuery.trim($(this).val())) $(this).prev("label").text(), $(this).parent().append('<span class="error">This field is required</span>'), $(this).addClass(
                    "inputError"), s = !0;
                else if ($(this).hasClass("email")) {
                    var r = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                    r.test(jQuery.trim($(this).val())) || ($(this).prev("label").text(), $(this).parent().append('<span class="error">Invalid email address</span>'), $(this).addClass(
                        "inputError"), s = !0);
                }
            }), !s) {
            $("form#form input.submit").fadeOut("normal", function() {
                $(this).parent().append("");
            });
            var r = $(this).serialize();
            $.post($(this).attr("action"), r, function() {
                $("form#form").slideUp("fast", function() {
                    $(this).before('<div class="success">Your email was sent successfully.</div>');
                });
            });
        }
        return !1;
    });
	// 11.1. contact modal
    $(".contact-modal-launcher, .contact-modal-closer").on("click", function(e) {
        e.preventDefault();
        if ($(".contact-modal").hasClass("open")) {
            $(".contact-modal").removeClass("open");
        } else {
            $(".contact-modal").addClass("open");
        }
    });
	
	
});