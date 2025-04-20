
class Slider{

    constructor(selector, options = {}){

        this.sliderComponent = document.querySelector(selector);

        const defaultOptions = {

            animationType: 'slide',
            speed: 300,
            drag: true,
            loop: false,
            autoplay: false,
            interval: 4000,
            navigation: false,
            dotPagination: false,
            numberPagination: false,
            playStop: false,
            align: 'left',
            startPosition: 1,
            perSlide: 1,
            clone: 2,
            dragDistance: 120,
            gap: true,
            gapSize: 32,
            sidePadding: 32,
            maxWidth: null,
            slideWidth: false,
            slideHeight: false,

        };

        this.options = { ...defaultOptions, ...options };

        this.animation_slide = {

            property: 'transform',
            duration: this.options.speed,
            time: 'cubic-bezier(0.25,1,0.25,1)',
        }

        this.animation_fade = {

            property: 'opacity',
            duration: this.options.speed,
            time: 'ease-out',
        }

        this.align_type = {

            left    : (slider_position) => 0,
            center  : (slider_position) => (this.slider.getBoundingClientRect().width - this.slider.children[slider_position].getBoundingClientRect().width)/2,
            right   : (slider_position) => (this.slider.getBoundingClientRect().width - this.slider.children[slider_position].getBoundingClientRect().width),
        };

        this.iconTag = {
            prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60"><path></path></svg>',
            next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60"><path></path></svg>',
            play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><path></path></svg>',
            stop: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><path></path></svg>'
        };
        
        this.iconPath = {
            prev: 'M13.939 4.939 6.879 12l7.06 7.061 2.122-2.122L11.121 12l4.94-4.939z',
            next: 'M10.061 19.061 17.121 12l-7.06-7.061-2.122 2.122L12.879 12l-4.94 4.939z',
            play: 'M7 6v12l10-6z',
            stop: 'M7 7h10v10H7z'
        };

        this.state = {
            position: this.options.startPosition - 1,
            busy: false,
            drag: false,
        };

        this.initializeSlider();
    }

    initializeSlider(){

        this.slider_frame = this.sliderComponent.querySelector('.slider-frame');
        this.slider = this.slider_frame.querySelector('.slider');

        if(this.options.animationType == 'slide'){ this.setSlideTypeSizes(); }
        if(this.options.animationType == 'fade'){ this.setFadeTypeSizes(); }

        if(this.options.animationType == 'slide' && this.options.loop){ this.createClone(this.options.clone); }

        this.total_slide = this.slider.children.length;

        if(this.options.numberPagination){ this.createNumberPagination(); }
        if(this.options.dotPagination){ this.createDotPagination(); }
        if(this.options.navigation){ this.createNavigationButton(); }
        if(this.options.playStop){ this.createPlayStop(); }

        // -------- // PREPARE
        if(this.options.animationType == 'slide'){ this.prepare_slide_structure(); }
        if(this.options.animationType == 'fade'){ this.prepare_fade_structure(); }
        // -------- // PREPARE

        if(this.options.autoplay){ this.start_AUTOPLAY(); }
        if(this.options.drag){ if(this.options.animationType == 'slide'){ this.startDragSlide(); } else if (this.options.animationType == 'fade'){ this.startDragFade(); } }

        window.addEventListener('resize', this.handle_Size);

        // calculate drag limit points > for infinite drag
        if(this.options.animationType == 'slide'){ if(this.options.loop){ this.side_calculation(); } }

        this.slider_frame.addEventListener('click', (event) => this.handle_Click(event));
    }

    handle_Click(event){ if(this.state.drag){ event.preventDefault(); event.stopPropagation(); } }

    place_to(go_){ let n_ = 0; let p_ = 0; while( n_ < go_ ){ p_ = p_ + this.slider.children[n_].getBoundingClientRect().width + this.options.gapSize; n_ = n_ + 1;} return p_; }

    // --------------------------------------- // PREPARE
    prepare_slide_structure(){

        // PLACEMENT > FIRST SLIDE
        this.update_slide_position(this.state.position); this.pagination_position(this.state.position);
        // PLACEMENT > FIRST SLIDE

        setTimeout(this.create_slide_animation, 100);
    }

    prepare_fade_structure(){

        // ORDER > FRONT TO BACK
        let slide_page = 0;
        while(slide_page < this.total_slide){

            this.slider.children[slide_page].style.zIndex = slide_page + 1;
            this.slider.children[slide_page].style.opacity = 0;
            this.slider.children[slide_page].style.visibility = 'hidden';
            this.slider.children[slide_page].style.transform = 'translateX' + '(' + (slide_page * -100) + '%' + ')';

            slide_page = slide_page + 1;
        }
        // ORDER > FRONT TO BACK

        // PLACEMENT > FIRST SLIDE
        this.slider.children[this.state.position].style.zIndex = 20;
        this.slider.children[this.state.position].style.opacity = 1;
        this.slider.children[this.state.position].style.visibility = 'visible';

        this.pagination_position(this.state.position);
        // PLACEMENT > FIRST SLIDE
    }
    // --------------------------------------- // PREPARE

    // --------------------------------------- // SIZE

    handle_Size = () => {

        if(this.options.autoplay){ this.stop_AUTOPLAY(); }

        if(this.options.animationType == 'slide'){ this.remove_slide_animation(); this.setSlideTypeSizes(); this.update_slide_position(this.state.position); }
        if(this.options.animationType == 'fade'){ this.setFadeTypeSizes(); this.update_fade_position(); }

        if(this.options.autoplay){ this.start_AUTOPLAY(); }
    
    }

    setSlideTypeSizes(){

        if(this.options.maxWidth){ this.sliderComponent.style.maxWidth = this.options.maxWidth + 'px'; }

        this.slider_frame.style.paddingLeft = this.options.sidePadding + 'px';
        this.slider_frame.style.paddingRight = this.options.sidePadding + 'px';
        this.slider.style.gap = this.options.gapSize + 'px';

        if( !this.options.slideWidth ){

            this.slider_item = this.sliderComponent.querySelectorAll('.slide-item');

            this.slider_item.forEach(slide => { slide.style.width = (this.slider.getBoundingClientRect().width - this.options.gapSize * (this.options.perSlide - 1))/this.options.perSlide + 'px'; });
        }
    }

    setFadeTypeSizes(){

        if(this.options.maxWidth){ this.sliderComponent.style.maxWidth = this.options.maxWidth + 'px'; }

        this.slider_frame.style.paddingLeft = this.options.sidePadding + 'px';
        this.slider_frame.style.paddingRight = this.options.sidePadding + 'px';

    }
    // --------------------------------------- // SIZE

    createClone(clone){

        let leftClone = {}; let rightClone = {}; let last_node = this.slider.children.length - 1; let n_clone;

        n_clone = 0; while( n_clone < clone ){ leftClone[n_clone] = this.slider.children[n_clone].cloneNode(true); n_clone = n_clone + 1; }
        n_clone = 0; while( n_clone < clone ){ rightClone[n_clone] = this.slider.children[last_node - n_clone].cloneNode(true); n_clone = n_clone + 1; }

        n_clone = 0; while( n_clone < clone ){ this.slider.appendChild(leftClone[n_clone]) ; n_clone = n_clone + 1; }
        n_clone = 0; while( n_clone < clone ){ this.slider.insertBefore(rightClone[n_clone], this.slider.firstElementChild) ; n_clone = n_clone + 1; }

        this.state.position = this.state.position + clone;
    }

    // ---------------------- // PLAY + STOP
    createPlayStop(){

        let playStopComponent = document.createElement('div');
        playStopComponent.classList.add('play-stop-component');

        this.play_component = document.createElement('div');
        this.play_component.classList.add('play-component');
        this.play_component.appendChild(this.iconCreate('play'));

        this.stop_component = document.createElement('div');
        this.stop_component.classList.add('stop-component');
        this.stop_component.appendChild(this.iconCreate('stop'));

        if(this.options.autoplay){ this.stop_component.classList.add('pulse'); } else { this.play_component.classList.add('pulse'); }

        playStopComponent.appendChild(this.play_component);
        playStopComponent.appendChild(this.stop_component);

        this.sliderComponent.appendChild(playStopComponent);

        this.play_component.addEventListener('click', this.playSlide);
        this.stop_component.addEventListener('click', this.stopSlide);
    }
    // ---------------------- //

    // ---------------------- // NAVIGATION BUTTONS
    createNavigationButton(){

        let slider_previous_button = document.createElement('div');
        slider_previous_button.classList.add('slide-buton','slide-previous');
        slider_previous_button.appendChild(this.iconCreate('prev'));

        let slider_next_button = document.createElement('div');
        slider_next_button.classList.add('slide-buton','slide-next');
        slider_next_button.appendChild(this.iconCreate('next'));

        this.sliderComponent.appendChild(slider_previous_button);
        this.sliderComponent.appendChild(slider_next_button);

        if(this.options.animationType == 'slide'){

            slider_previous_button.addEventListener('click', this.previous_slide);
            slider_next_button.addEventListener('click', this.next_slide);

        } else if(this.options.animationType == 'fade'){

            slider_previous_button.addEventListener('click', this.previous_fade);
            slider_next_button.addEventListener('click', this.next_fade);
        }
    }
    // ---------------------- //

    // ---------------------- // CREATE ICONS
    iconCreate(iconName){

        let iconComponent = document.createElement('div'); iconComponent.innerHTML = this.iconTag[iconName];
        let iconUse = iconComponent.querySelector('svg'); iconUse.querySelector('path').setAttribute('d', this.iconPath[iconName]); return iconUse;
    }
    // ---------------------- //

    createNumberPagination(){

        let slider_number_pagination = document.createElement('div'); slider_number_pagination.classList.add('slider-number-pagination');
    
        let slide_page = 0; let slide_total_page = this.total_slide;
    
        if( this.options.animationType == 'slide' ){ if(this.options.loop){ slide_total_page = this.total_slide - (this.options.clone * 2); } }
    
        while( slide_page < slide_total_page ){
    
            let one_page_buton = document.createElement('div'); one_page_buton.classList.add('page-number');
            one_page_buton.setAttribute('data-page',slide_page); one_page_buton.textContent = slide_page + 1;
    
            slider_number_pagination.appendChild(one_page_buton);
            slide_page = slide_page + 1;
        }
    
        this.sliderComponent.appendChild(slider_number_pagination);
        this.pagination_number = this.sliderComponent.querySelectorAll('.page-number');
        this.pagination_number.forEach(buton => { buton.addEventListener('click', (event) => this.goSlidePage(event)); });
    }

    createDotPagination(){
    
        let slider_dot_pagination = document.createElement('div'); slider_dot_pagination.classList.add('slider-dot-pagination');
    
        let slide_page = 0; let slide_total_page = this.total_slide;
    
        if( this.options.animationType == 'slide' ){ if(this.options.loop){ slide_total_page = this.total_slide - (this.options.clone * 2); } }
    
        while( slide_page < slide_total_page ){
    
            let one_page_buton = document.createElement('div'); one_page_buton.classList.add('page-dot');
            one_page_buton.setAttribute('data-page',slide_page);
    
            slider_dot_pagination.appendChild(one_page_buton);
            slide_page = slide_page + 1;
        }
    
        this.sliderComponent.appendChild(slider_dot_pagination);
        this.pagination_dot = this.sliderComponent.querySelectorAll('.page-dot');
        this.pagination_dot.forEach(buton => { buton.addEventListener('click', (event) => this.goSlidePage(event)); });
    }

    start_AUTOPLAY(){ if(this.options.animationType == 'slide'){ this.auto_interval = setInterval(this.next_slide, this.options.interval); }else if(this.options.animationType == 'fade'){ this.auto_interval = setInterval(this.next_fade, this.options.interval); } }
    stop_AUTOPLAY(){ clearInterval(this.auto_interval); }

    reset_AUTOPLAY(){ this.stop_AUTOPLAY(); this.start_AUTOPLAY(); }

    playSlide = () => {

        if( this.options.autoplay ){ return; }
        this.start_AUTOPLAY(); this.options.autoplay = true; this.play_component.classList.remove('pulse'); this.stop_component.classList.add('pulse');
    }
    stopSlide = () => {

        if( !this.options.autoplay ){ return; }
        this.stop_AUTOPLAY(); this.options.autoplay = false; this.stop_component.classList.remove('pulse'); this.play_component.classList.add('pulse');
    }

    to_slide = (open_position) => {

        this.create_slide_animation();
        this.update_slide_position(open_position); this.pagination_position(open_position);
        if(this.options.autoplay){ this.reset_AUTOPLAY(); }
    }

    next_slide = () => {

        if(this.state.busy){ return; }
        this.state.busy = true; setTimeout(this.closeState, this.animation_slide.duration - 100);

        if(!this.options.loop){

            if(this.state.position < this.total_slide - 1){

                this.to_slide(this.state.position + 1);
            }

            return;
        }
    
        if (this.state.position < this.total_slide - (this.options.clone + 1)){

            this.to_slide(this.state.position + 1);

        } else {

            this.remove_slide_animation();
            this.update_slide_position(this.options.clone - 1); setTimeout(() => this.to_slide(this.state.position + 1),10);
        }
    }
    previous_slide = () => {

        if(this.state.busy){ return; }
        this.state.busy = true; setTimeout(this.closeState, this.animation_slide.duration - 100);

        if(!this.options.loop){

            if(this.state.position > 0){

                this.to_slide(this.state.position - 1);
            }

            return;
        }

        if (this.state.position > this.options.clone){

            this.to_slide(this.state.position - 1);

        } else {

            this.remove_slide_animation();
            this.update_slide_position(this.total_slide - this.options.clone); setTimeout(() => this.to_slide(this.state.position - 1),10);
        }
    }

    goSlidePage(event){

        const page_element = event.target;

        if(this.options.animationType == 'slide'){

            this.state.position = Number(page_element.getAttribute('data-page'));
            if(this.options.loop){this.state.position = this.state.position + this.options.clone};
    
            this.update_slide_position(this.state.position); this.pagination_position(this.state.position);
    
        } else if (this.options.animationType == 'fade'){
    
            if(this.state.busy){ return; }
    
            this.open_slide = this.state.position; this.go_slide = Number(page_element.getAttribute('data-page'));
    
            this.update_fade_position();
        }
    
        if(this.options.autoplay){ this.reset_AUTOPLAY(); }
    }

    pagination_position(slider_position_item){

        if(this.options.animationType == 'slide'){ if(this.options.loop){ slider_position_item = slider_position_item - this.options.clone; } }
    
        if(this.options.numberPagination){
    
            this.pagination_number.forEach(buton => { if(buton.classList.contains('pulse')){buton.classList.remove('pulse')}; });
            this.pagination_number[slider_position_item].classList.add('pulse');
        }
    
        if(this.options.dotPagination){
    
            this.pagination_dot.forEach(buton => { if(buton.classList.contains('pulse')){buton.classList.remove('pulse')}; });
            this.pagination_dot[slider_position_item].classList.add('pulse');
        }
    }

    // ---------------------- // UPDATE SLIDE PAGE
    update_slide_position(go_position){

        this.state.position = go_position;
        this.slide_align = this.align_type[this.options.align](this.state.position);

        this.distance_offset = this.place_to( this.state.position ); this.distance_offset = (-this.distance_offset + this.slide_align) + 'px';
        this.slider.style.transform = "translateX(" + this.distance_offset + ")";
    }
    // ---------------------- //

    // ---------------------- // ANIMATION
    create_slide_animation = () => {
        if(!this.slider.style.transitionProperty){

            this.slider.style.transitionProperty = this.animation_slide.property;
            this.slider.style.transitionDuration = this.animation_slide.duration + 'ms';
            this.slider.style.transitionTimingFunction = this.animation_slide.time;
        }
    }

    remove_slide_animation = () => {
        if(this.slider.style.transitionProperty){

            this.slider.style.removeProperty("transition-property");
            this.slider.style.removeProperty("transition-duration");
            this.slider.style.removeProperty("transition-timing-function");
        }
    }
    // ---------------------- //

    // ----------------- // FADE NAVIGATION BUTTONS

    next_fade = () => {

        if(this.state.busy){ return; }

        this.open_slide = this.state.position;
        if( this.state.position == this.total_slide - 1 ){ if( this.options.loop ){ this.go_slide = 0; } else { return; } } else { this.go_slide = this.state.position + 1; }

        this.update_fade_position(); if(this.options.autoplay){ this.reset_AUTOPLAY(); }
    }

    previous_fade = () => {

        if(this.state.busy){ return; }

        this.open_slide = this.state.position;
        if( this.state.position == 0 ){ if( this.options.loop ){ this.go_slide = this.total_slide - 1; } else { return; } } else { this.go_slide = this.state.position - 1; }

        this.update_fade_position(); if(this.options.autoplay){ this.reset_AUTOPLAY(); }
    }

    update_fade_position = () => {

        if( this.open_slide == this.go_slide ){ return; }
        this.state.busy = true; setTimeout(this.closeState, this.animation_fade.duration + 20);

        // prepare position
        this.slider.children[this.open_slide].style.zIndex = this.open_slide + 1;
        this.create_fade_animation();

        // go slide
        this.slider.children[this.go_slide].style.zIndex = 20;
        this.slider.children[this.go_slide].style.opacity = 1;
        this.slider.children[this.go_slide].style.visibility = 'visible';

        // close slide
        setTimeout(this.close_fade_slide, this.animation_fade.duration + 10 );
        setTimeout(this.remove_fade_animation, this.animation_fade.duration + 10 );

        this.state.position = this.go_slide;
        this.pagination_position(this.state.position);
    }

    close_fade_slide = () => {

        this.slider.children[this.open_slide].style.opacity = 0;
        this.slider.children[this.open_slide].style.visibility = 'hidden';
    }

    create_fade_animation = () => {

        this.slider.children[this.go_slide].style.transitionProperty = this.animation_fade.property;
        this.slider.children[this.go_slide].style.transitionDuration = this.animation_fade.duration + 'ms';
        this.slider.children[this.go_slide].style.transitionTimingFunction = this.animation_fade.time;
    }

    remove_fade_animation = () => {

        this.slider.children[this.go_slide].style.removeProperty('transition-property');
        this.slider.children[this.go_slide].style.removeProperty('transition-duration');
        this.slider.children[this.go_slide].style.removeProperty('transition-timing-function');
    }
    // ----------------- // FADE NAVIGATION BUTTONS

    // ------------------------ // DRAG

    start_drag = () => { this.state.drag = true; }
    stop_drag = () => { this.state.drag = false; }

    // ----------------- // DRAG TYPE : SLIDE

    startDragSlide(){

        this.slider_frame.addEventListener('mousedown', (event) => this.drag_start_slide(event));
        this.slider_frame.addEventListener('touchstart', (event) => this.drag_start_slide(event), { passive: false });
    }

    place_to(go_){ let n_ = 0; let p_ = 0; while( n_ < go_ ){ p_ = p_ + this.slider.children[n_].getBoundingClientRect().width + this.options.gapSize; n_ = n_ + 1;} return p_; }

    side_calculation(){

        this.left_clone_01 = this.place_to( this.options.clone ); this.right_clone_01 = this.place_to( this.total_slide - ( this.options.clone ) );
        this.left_clone_02 = this.place_to( this.options.clone - 1 ); this.right_clone_02 = this.place_to( this.total_slide - ( this.options.clone + 1 ) );
    }

    drag_start_slide = (event) => {

        console.log('start > drag'); event.preventDefault();

        if(this.state.busy){ return; }

        this.stop_drag(); if(this.options.autoplay){ this.stop_AUTOPLAY(); }

        this.to_position = this.state.position; this.startX = this.get_positionX(event);

        this.sliderComponent.classList.add('no-select');
        this.remove_slide_animation();

        this.distance_offset_start = this.place_to( this.state.position );

        window.addEventListener('mousemove', this.drag_move_slide);
        window.addEventListener('touchmove', this.drag_move_slide);
        window.addEventListener('mouseup', this.drag_end_slide);
        window.addEventListener('touchend', this.drag_end_slide);
    }

    drag_move_slide = (event) => {

        this.state.busy = true;

        console.log('drag > move'); this.start_drag(); let align = this.slide_align; let distance = this.options.dragDistance; let diffX,diffX_end,slide_distance,slider_position_end;

        this.currentX = this.get_positionX(event);
        diffX = this.currentX - this.startX;

        if( this.options.loop ){

            // ---------------------------------------------- // SET DRAG > LIVE POSITION
            this.distance_offset = (-this.distance_offset_start + diffX) + align;

            if( diffX > 0 && diffX > distance && this.distance_offset > -(this.left_clone_01 - distance) + align ){

                this.distance_offset_start = this.right_clone_01;

                this.state.position = (this.total_slide - this.options.clone);
                diffX = (distance);
                this.startX = this.currentX - diffX;
                this.distance_offset = (-this.distance_offset_start) + align + diffX;

            } else if( diffX > 0 && -diffX < distance && this.distance_offset < -(this.right_clone_01 - distance) + align ){

                this.distance_offset_start = this.left_clone_01;

                this.state.position = (this.options.clone);
                diffX = (distance);
                this.startX = this.currentX - diffX;
                this.distance_offset = (-this.distance_offset_start) + align + diffX;
            }

            if( diffX < 0 && -diffX > distance && this.distance_offset < -(this.right_clone_02 + distance) + align ){

                this.distance_offset_start = this.left_clone_02;

                this.state.position = (this.options.clone - 1);
                diffX = (-distance);
                this.startX = this.currentX - diffX;
                this.distance_offset = (-this.distance_offset_start) + align + diffX;

            } else if( diffX < 0 && diffX < distance && this.distance_offset > -(this.left_clone_02 + distance) + align ){

                this.distance_offset_start = this.right_clone_02;

                this.state.position = (this.total_slide - (this.options.clone + 1));
                diffX = (-distance);
                this.startX = this.currentX - diffX;
                this.distance_offset = (-this.distance_offset_start) + align + diffX;
            }

            this.slider.style.transform = "translateX(" + this.distance_offset + 'px' + ")";

            console.log(this.state.position);
            // ---------------------------------------------- // SET DRAG > LIVE POSITION

            // ---------------------------------------------- // SET NEW > SLIDE POSITION
            diffX_end = diffX; slider_position_end = this.state.position;

            if( Math.abs(diffX_end) > distance && diffX_end < 0 ){

                slide_distance = this.slider.children[slider_position_end].getBoundingClientRect().width + this.options.gapSize;

                if(Math.abs(diffX_end) > slide_distance){

                    while(Math.abs(diffX_end) > slide_distance){

                        diffX_end = diffX_end - slide_distance * (diffX_end/Math.abs(diffX_end));
                        slider_position_end = slider_position_end + 1;
                        slide_distance = this.slider.children[slider_position_end].getBoundingClientRect().width + this.options.gapSize;
                    }

                    if( Math.abs(diffX_end) > distance ){

                        diffX_end = diffX_end - distance * (diffX_end/Math.abs(diffX_end));
                        slider_position_end = slider_position_end + 1;
                    }
                }
                else if( Math.abs(diffX_end) > distance ){

                    diffX_end = diffX_end - distance * (diffX_end/Math.abs(diffX_end));
                    slider_position_end = slider_position_end + 1;
                }

            } else if( Math.abs(diffX_end) > distance && diffX_end > 0 ){

                slide_distance = this.slider.children[slider_position_end - 1].getBoundingClientRect().width + this.options.gapSize;

                if(Math.abs(diffX_end) > slide_distance){

                    while(Math.abs(diffX_end) > slide_distance){

                        diffX_end = diffX_end - slide_distance * (diffX_end/Math.abs(diffX_end));
                        slider_position_end = slider_position_end - 1;
                        slide_distance = this.slider.children[slider_position_end - 1].getBoundingClientRect().width + this.options.gapSize;
                    }

                    if( Math.abs(diffX_end) > distance ){

                        diffX_end = diffX_end - distance * (diffX_end/Math.abs(diffX_end));
                        slider_position_end = slider_position_end - 1;
                    }
                }
                else if( Math.abs(diffX_end) > distance ){

                    diffX_end = diffX_end - distance * (diffX_end/Math.abs(diffX_end));
                    slider_position_end = slider_position_end - 1;
                }

            }
            // ---------------------------------------------- // SET NEW > SLIDE POSITION

            if( slider_position_end > this.total_slide - (this.options.clone + 1) ){ slider_position_end = slider_position_end - 1; } else if ( slider_position_end < this.options.clone ){ slider_position_end = slider_position_end + 1; }

        }

        if( !(this.options.loop) ){

            // ---------------------------------------------- // CALCULATE > START + END > LIMIT

            let start_position = - distance;
            let end_position = this.place_to( this.total_slide - 1 );

            end_position = end_position + distance;
            // ---------------------------------------------- // CALCULATE > START + END > LIMIT

            // ---------------------------------------------- // SET DRAG > LIVE POSITION
            this.distance_offset = this.distance_offset_start;

            if( this.distance_offset - diffX > start_position && this.distance_offset - diffX < end_position ){

                this.distance_offset = (-this.distance_offset + diffX + align ) + 'px';
                this.slider.style.transform = "translateX(" + this.distance_offset + ")";
            }
            // ---------------------------------------------- // SET DRAG > LIVE POSITION

            // ---------------------------------------------- // SET NEW > SLIDE POSITION
            diffX_end = diffX; slider_position_end = this.state.position;

            if( Math.abs(diffX_end) > distance && diffX_end < 0 ){

                slide_distance = null;
                if(slider_position_end < this.total_slide - 1){ slide_distance = this.slider.children[slider_position_end].getBoundingClientRect().width + this.options.gapSize; }

                if(slide_distance && Math.abs(diffX_end) > slide_distance){

                    while(slide_distance && Math.abs(diffX_end) > slide_distance){

                        diffX_end = diffX_end - slide_distance * (diffX_end/Math.abs(diffX_end));
                        slider_position_end = slider_position_end + 1;

                        slide_distance = null;
                        if(slider_position_end < this.total_slide - 1){ slide_distance = this.slider.children[slider_position_end].getBoundingClientRect().width + this.options.gapSize; }
                    }

                    if( Math.abs(diffX_end) > distance ){

                        diffX_end = diffX_end - distance * (diffX_end/Math.abs(diffX_end));
                        if(slider_position_end < this.total_slide - 1){ slider_position_end = slider_position_end + 1; }
                    }
                }
                else if( Math.abs(diffX_end) > distance ){

                    diffX_end = diffX_end - distance * (diffX_end/Math.abs(diffX_end));
                    if(slider_position_end < this.total_slide - 1){ slider_position_end = slider_position_end + 1; }
                }

            } else if( Math.abs(diffX_end) > distance && diffX_end > 0 ){

                slide_distance = null;
                if(slider_position_end > 0){ slide_distance = this.slider.children[slider_position_end - 1].getBoundingClientRect().width + this.options.gapSize; }

                if(slide_distance && Math.abs(diffX_end) > slide_distance){

                    while(slide_distance && Math.abs(diffX_end) > slide_distance){

                        diffX_end = diffX_end - slide_distance * (diffX_end/Math.abs(diffX_end));
                        slider_position_end = slider_position_end - 1;

                        slide_distance = null;
                        if(slider_position_end > 0){ slide_distance = this.slider.children[slider_position_end - 1].getBoundingClientRect().width + this.options.gapSize; }
                    }

                    if( Math.abs(diffX_end) > distance ){

                        diffX_end = diffX_end - distance * (diffX_end/Math.abs(diffX_end));
                        if(slider_position_end > 0){ slider_position_end = slider_position_end - 1; }
                    }
                }
                else if( Math.abs(diffX_end) > distance ){

                    diffX_end = diffX_end - distance * (diffX_end/Math.abs(diffX_end));
                    if(slider_position_end > 0){ slider_position_end = slider_position_end - 1; }
                }

            }
            // ---------------------------------------------- // SET NEW > SLIDE POSITION

        }

        this.to_position = slider_position_end;
        this.pagination_position(this.to_position); console.log(this.to_position);
    }

    drag_end_slide = (event) => {

        console.log('end > drag');

        this.sliderComponent.classList.remove('no-select');
        this.create_slide_animation();

        this.update_slide_position(this.to_position);

        if(this.options.autoplay){ this.start_AUTOPLAY(); }

        window.removeEventListener('mousemove', this.drag_move_slide);
        window.removeEventListener('touchmove', this.drag_move_slide);
        window.removeEventListener('mouseup', this.drag_end_slide);
        window.removeEventListener('touchend', this.drag_end_slide);

        if(this.state.drag){ this.slider.addEventListener('transitionend',this.closeState); }
        setTimeout(this.stop_drag,10);
    }

    get_positionX(event){ return event.type.includes('mouse') ? event.pageX : event.touches[0].pageX; }
    // ----------------- // DRAG TYPE : SLIDE

    // ----------------- // DRAG TYPE : FADE
    startDragFade(){

        this.slider_frame.addEventListener('mousedown', this.drag_start_fade);
        this.slider_frame.addEventListener('touchstart', this.drag_start_fade, { passive: false });
    }

    drag_start_fade = (event) => {

        console.log('start > drag'); event.preventDefault();

        if(this.state.busy){ return; }

        this.stop_drag();

        if(this.options.autoplay){ this.stop_AUTOPLAY(); }

        this.open_slide = this.state.position; this.go_slide = null; this.startX = this.get_positionX(event);

        this.sliderComponent.classList.add('no-select');

        window.addEventListener('mousemove', this.drag_move_fade);
        window.addEventListener('touchmove', this.drag_move_fade);
        window.addEventListener('mouseup', this.drag_end_fade);
        window.addEventListener('touchend', this.drag_end_fade);
    }

    drag_move_fade = (event) => {

        console.log('drag > move'); this.start_drag(); let distance = this.options.dragDistance; let diffX,diffX_end;

        // ---------------------------------------------- // USER DRAG : LIVE POSITION
        this.currentX = this.get_positionX(event); diffX = this.currentX - this.startX;
        // ---------------------------------------------- // USER DRAG : LIVE POSITION

        // ---------------------------------------------- // CALCULATE : END POSITION
        diffX_end = diffX;

        if(Math.abs(diffX_end) > distance){ this.go_slide = this.open_slide - 1 * (diffX_end/Math.abs(diffX_end)); } else { this.go_slide = null; }

        if(this.options.loop){ if(this.go_slide < 0){ this.go_slide = this.total_slide - 1; } else if (this.go_slide > this.total_slide - 1){ this.go_slide = 0; } }
        if(!this.options.loop){ if(this.go_slide < 0){ this.go_slide = null; } else if (this.go_slide > this.total_slide - 1){ this.go_slide = null; } }
        // ---------------------------------------------- // CALCULATE : END POSITION

    }

    drag_end_fade = (event) => {

        console.log('end > drag'); this.state.busy = true; setTimeout(this.closeState, this.animation_fade.duration + 20);

        this.sliderComponent.classList.remove('no-select');

        if( this.go_slide !== null ){ this.update_fade_position(); }
        if(this.options.autoplay){ this.start_AUTOPLAY(); }

        window.removeEventListener('mousemove', this.drag_move_fade);
        window.removeEventListener('touchmove', this.drag_move_fade);
        window.removeEventListener('mouseup', this.drag_end_fade);
        window.removeEventListener('touchend', this.drag_end_fade);

        setTimeout(this.stop_drag,10);
    }
    // ----------------- // DRAG TYPE : FADE

    // ------------------------ // DRAG

    closeState = () => { this.state.busy = false; }

}
