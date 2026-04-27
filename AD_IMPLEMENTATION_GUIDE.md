# Ad Implementation Guide for Lesson Pages

## What Was Added

### 1. AdSense Meta Tag (All 7 lesson files)
Added to `<head>` section:
```html
<meta name="google-adsense-account" content="ca-pub-2970695859332311">
```

### 2. CSS for 3-Column Layout (lessons.css)
Added styles for:
- `.content-wrapper` - 3-column grid (160px | 1fr | 160px)
- `.ad-column` - Sticky sidebar ads
- `.ad-unit` - 160x600 vertical ad containers
- `.content-column` - Center content area
- Responsive breakpoint at 1200px (hides ads on smaller screens)

### 3. HTML Structure Template

Wrap lecture content with this structure:

```html
<!-- 3-COLUMN CONTENT WRAPPER -->
<div class="content-wrapper">
    
    <!-- LEFT AD COLUMN -->
    <aside class="ad-column ad-column-left">
        <div class="ad-unit">
            <div class="ad-unit-label">Advertisement</div>
            <!-- Google AdSense Code -->
            <ins class="adsbygoogle"
                 style="display:inline-block;width:160px;height:600px"
                 data-ad-client="ca-pub-2970695859332311"
                 data-ad-slot="LEFT_AD_SLOT"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            <!-- Placeholder (shown before AdSense loads) -->
            <div class="ad-placeholder-vertical">
                <span>📢</span>
                <p>160x600</p>
                <small>Ad Space</small>
            </div>
        </div>
    </aside>

    <!-- CENTER CONTENT COLUMN -->
    <div class="content-column">
        
        <!-- ALL LECTURE CONTENT GOES HERE -->
        
    </div><!-- /content-column -->

    <!-- RIGHT AD COLUMN -->
    <aside class="ad-column ad-column-right">
        <div class="ad-unit">
            <div class="ad-unit-label">Advertisement</div>
            <!-- Google AdSense Code -->
            <ins class="adsbygoogle"
                 style="display:inline-block;width:160px;height:600px"
                 data-ad-client="ca-pub-2970695859332311"
                 data-ad-slot="RIGHT_AD_SLOT"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            <!-- Placeholder -->
            <div class="ad-placeholder-vertical">
                <span>📢</span>
                <p>160x600</p>
                <small>Ad Space</small>
            </div>
        </div>
    </aside>

</div><!-- /content-wrapper -->
```

## Implementation Status

| File | Meta Tag | 3-Column Layout | Status |
|------|----------|-----------------|--------|
| html.html | ✅ | ✅ | Complete |
| python.html | ✅ | ✅ | Complete |
| c++.html | ✅ | ✅ | Complete (minor Lecture 2 duplication) |
| css.html | ✅ | ❌ | Needs layout wrapper |
| java.html | ✅ | ❌ | Needs layout wrapper |
| javascript.html | ✅ | ❌ | Needs layout wrapper |
| c.html | ✅ | ❌ | Needs layout wrapper |

## Next Steps

1. Replace `LEFT_AD_SLOT` and `RIGHT_AD_SLOT` with actual AdSense slot IDs
2. Apply the 3-column HTML structure to: css.html, java.html, javascript.html, c.html
3. To hide placeholders after AdSense loads, add to CSS:
   ```css
   .adsbygoogle[data-ad-status="filled"] + .ad-placeholder-vertical {
       display: none;
   }
   ```

## Files Modified
- `f:\myweb\lessons.css` - Added 3-column layout CSS
- `f:\myweb\lessons\html.html` - Complete implementation
- `f:\myweb\lessons\python.html` - Complete implementation  
- `f:\myweb\lessons\c++.html` - Complete implementation
- `f:\myweb\lessons\css.html` - Meta tag only
- `f:\myweb\lessons\java.html` - Meta tag only
- `f:\myweb\lessons\javascript.html` - Meta tag only
- `f:\myweb\lessons\c.html` - Meta tag only
