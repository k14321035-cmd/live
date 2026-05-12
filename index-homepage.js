// Homepage Learning Paths JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Toggle between learning paths and all courses
    const viewAllBtn = document.querySelector('.view-all-btn');
    const allCoursesSection = document.getElementById('all-courses');
    const learningPathsSection = document.getElementById('learning-paths');
    
    if (viewAllBtn && allCoursesSection && learningPathsSection) {
        viewAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (allCoursesSection.style.display === 'none') {
                // Show all courses
                allCoursesSection.style.display = 'block';
                learningPathsSection.style.display = 'none';
                viewAllBtn.textContent = '← Back to Learning Paths';
                
                // Smooth scroll to courses section
                allCoursesSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Show learning paths
                allCoursesSection.style.display = 'none';
                learningPathsSection.style.display = 'block';
                viewAllBtn.textContent = 'Browse All 23+ Courses →';
                
                // Smooth scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    // Add hover effects to learning path cards
    const pathCards = document.querySelectorAll('.learning-path-card');
    pathCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click tracking for analytics (placeholder)
    const trackableElements = document.querySelectorAll('.path-course, .quick-start-card, .path-action');
    trackableElements.forEach(element => {
        element.addEventListener('click', function() {
            const elementText = this.textContent.trim();
            const elementClass = this.className;
            console.log('Analytics: User clicked', elementText, elementClass);
            
            // Here you would normally send data to your analytics service
            // Example: gtag('event', 'course_click', { 'course_name': elementText });
        });
    });
    
    // Add smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe learning path cards and quick start cards
    document.querySelectorAll('.learning-path-card, .quick-start-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
