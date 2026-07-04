# PWA Tutorial - Quick Testing Guide

## Test New User Experience

### Method 1: Browser Console
```javascript
// Clear all tutorial data
localStorage.removeItem('gadgetworld-tutorial-guided');
localStorage.removeItem('gadgetworld-tutorial-completed-date');

// Refresh the page
location.reload();
```

### Method 2: Incognito/Private Window
- Open site in incognito/private browsing mode
- Tutorial will automatically appear for "new" users

## Check Tutorial Status

```javascript
// View current tutorial status
console.log({
  guided: localStorage.getItem('gadgetworld-tutorial-guided'),
  date: localStorage.getItem('gadgetworld-tutorial-completed-date'),
  dateReadable: new Date(localStorage.getItem('gadgetworld-tutorial-completed-date')).toLocaleString()
});
```

## Simulate Different States

### Simulate Completed Tutorial
```javascript
localStorage.setItem('gadgetworld-tutorial-guided', 'true');
localStorage.setItem('gadgetworld-tutorial-completed-date', new Date().toISOString());
location.reload(); // Tutorial should NOT appear
```

### Simulate Skipped Tutorial (Recent)
```javascript
localStorage.setItem('gadgetworld-tutorial-guided', 'skipped');
localStorage.setItem('gadgetworld-tutorial-completed-date', new Date().toISOString());
location.reload(); // Tutorial should NOT appear (less than 90 days)
```

### Simulate Skipped Tutorial (90+ Days Ago)
```javascript
const ninetyOneDaysAgo = new Date();
ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 91);
localStorage.setItem('gadgetworld-tutorial-guided', 'skipped');
localStorage.setItem('gadgetworld-tutorial-completed-date', ninetyOneDaysAgo.toISOString());
location.reload(); // Tutorial SHOULD appear again
```

## Device Testing

### Test on Different Devices

1. **iOS (iPhone/Safari)**
   - Open in Safari browser
   - Tutorial will show iOS-specific instructions (blue gradient)
   
2. **Android (Chrome)**
   - Open in Chrome browser
   - Tutorial will show Android-specific instructions (green gradient)
   
3. **Desktop (Chrome/Edge)**
   - Open in desktop browser
   - Tutorial will show desktop-specific instructions (purple gradient)

### Simulate Different Devices (Chrome DevTools)
1. Press `F12` to open DevTools
2. Click device toolbar icon (or `Ctrl+Shift+M`)
3. Select device from dropdown:
   - iPhone SE/12/13 Pro → Shows iOS instructions
   - Pixel 5/Samsung Galaxy → Shows Android instructions
   - Responsive/Desktop → Shows desktop instructions
4. Refresh page to see device-specific tutorial

## Expected Behavior

### First Visit (New User)
- ✅ Page loads normally
- ✅ After 1 second, tutorial modal appears
- ✅ Progress bar shows 5 steps
- ✅ "Skip Tutorial" button visible on first step
- ✅ Device-specific instructions appear on step 3

### After Completing Tutorial
- ✅ localStorage sets `guided: 'true'`
- ✅ localStorage saves completion timestamp
- ✅ Tutorial won't appear on future visits

### After Skipping Tutorial
- ✅ localStorage sets `guided: 'skipped'`
- ✅ localStorage saves skip timestamp
- ✅ Tutorial MAY reappear after 90 days
- ✅ Tutorial won't appear before 90 days

### Clicking Close (X) Button
- ✅ Same as skipping - sets `guided: 'skipped'`

## Tutorial Flow Checklist

Walk through and verify each step:

- [ ] **Step 1**: Welcome message appears
  - [ ] "Welcome to Gadget World!" title
  - [ ] Typewriter animation works
  - [ ] "Get Started" button visible
  - [ ] "Skip Tutorial" button visible
  - [ ] Progress bar shows step 1/5

- [ ] **Step 2**: Device detection
  - [ ] Correct device type detected
  - [ ] Title reflects device type
  - [ ] "Show Me How" button visible
  - [ ] Progress bar shows step 2/5

- [ ] **Step 3**: Installation steps
  - [ ] Numbered steps appear (1-4 or 1-3)
  - [ ] Gradient background matches device (blue/green/purple)
  - [ ] Each step has bold title and explanation
  - [ ] "Next" button visible
  - [ ] Progress bar shows step 3/5

- [ ] **Step 4**: Shopping guide
  - [ ] Shopping cart icon visible
  - [ ] "Start Shopping" button visible
  - [ ] Progress bar shows step 4/5

- [ ] **Step 5**: Contact information
  - [ ] WhatsApp link clickable
  - [ ] Email link clickable
  - [ ] "Finish Tutorial" button visible
  - [ ] Progress bar shows step 5/5

- [ ] **Completion**: After last step
  - [ ] Modal closes
  - [ ] localStorage properly set
  - [ ] Tutorial doesn't reappear on refresh

## localStorage Values Reference

| State | `guided` Value | Will Show Again? |
|-------|---------------|------------------|
| Never seen | `null` | Yes (immediately) |
| Completed | `'true'` | No (never) |
| Skipped (recent) | `'skipped'` | No (wait 90 days) |
| Skipped (90+ days) | `'skipped'` | Yes (if condition met) |

## Browser Console Commands

### Force Show Tutorial
```javascript
localStorage.clear();
location.reload();
```

### Prevent Tutorial From Showing
```javascript
localStorage.setItem('gadgetworld-tutorial-guided', 'true');
localStorage.setItem('gadgetworld-tutorial-completed-date', new Date().toISOString());
```

### Check All localStorage
```javascript
Object.keys(localStorage).forEach(key => {
  if (key.includes('gadgetworld')) {
    console.log(key, '=', localStorage.getItem(key));
  }
});
```

### Debug Mode
```javascript
// Monitor localStorage changes
window.addEventListener('storage', (e) => {
  console.log('Storage changed:', {
    key: e.key,
    oldValue: e.oldValue,
    newValue: e.newValue
  });
});
```

## Common Issues & Solutions

### Issue: Tutorial appears every time
**Solution**: Check if browser is blocking localStorage (private mode)
```javascript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage is working ✅');
} catch (e) {
  console.error('localStorage is blocked ❌', e);
}
```

### Issue: Tutorial never appears
**Solution**: Check current localStorage state
```javascript
const guided = localStorage.getItem('gadgetworld-tutorial-guided');
if (guided) {
  console.log('Tutorial disabled because guided =', guided);
  console.log('Clear it with: localStorage.removeItem("gadgetworld-tutorial-guided")');
}
```

### Issue: Wrong device instructions
**Solution**: Check user agent detection
```javascript
const ua = navigator.userAgent.toLowerCase();
console.log({
  userAgent: ua,
  isIOS: /iphone|ipad|ipod/.test(ua),
  isAndroid: /android/.test(ua),
  isDesktop: !/iphone|ipad|ipod|android/.test(ua)
});
```

## Performance Testing

### Check Tutorial Load Time
```javascript
performance.mark('tutorial-start');
// Wait for tutorial to appear
setTimeout(() => {
  performance.mark('tutorial-end');
  performance.measure('tutorial-load', 'tutorial-start', 'tutorial-end');
  console.log('Tutorial appeared in:', 
    performance.getEntriesByName('tutorial-load')[0].duration, 'ms');
}, 2000);
```

## Accessibility Testing

- [ ] Can navigate with Tab key
- [ ] Can close with Escape key (if implemented)
- [ ] Screen reader announces modal
- [ ] Buttons have proper focus states
- [ ] Text contrast meets WCAG standards
- [ ] Works with keyboard only

## Mobile Testing Checklist

- [ ] Tutorial is responsive on small screens
- [ ] Text is readable without zooming
- [ ] Buttons are large enough to tap
- [ ] Modal doesn't overflow viewport
- [ ] Touch gestures work properly
- [ ] No horizontal scrolling

---

## Quick Commands

```javascript
// Show tutorial now
localStorage.clear(); location.reload();

// Hide tutorial forever
localStorage.setItem('gadgetworld-tutorial-guided', 'true'); location.reload();

// Check status
console.log(localStorage.getItem('gadgetworld-tutorial-guided'));

// Reset everything
Object.keys(localStorage).forEach(k => k.includes('gadgetworld') && localStorage.removeItem(k));
```
