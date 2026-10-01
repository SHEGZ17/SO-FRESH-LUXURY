// --- COMPLETE SO FRES# LUXURY SCRIPT (Cart + Form Validation) ---
document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. CART SYSTEM LOGIC
    // ==========================================
    let cart = JSON.parse(localStorage.getItem("so_fresh_cart")) || [];

    const cartBtn = document.getElementById("cartBtn");
    const cartModal = document.getElementById("cartModal");
    const closeCartBtn = document.getElementById("closeCartBtn");
    const cartOverlay = document.getElementById("cartOverlay");
    const cartBadge = document.getElementById("cartBadge");
    const cartCountHeader = document.getElementById("cartCountHeader");
    const cartItemsContainer = document.getElementById("cartItemsContainer");
    const cartTotalAmount = document.getElementById("cartTotalAmount");
    const whatsappCheckoutBtn = document.getElementById("whatsappCheckoutBtn");
    const toast = document.getElementById("toast");

    //  active WhatsApp contact number for checkout
    const whatsappNumber = "2348106205953"; 

    // Mobile Hamburger Menu Toggle
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");
    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    // Drawer Toggles
    function openCart() {
        if (cartModal) cartModal.classList.add("active");
    }

    function closeCart() {
        if (cartModal) cartModal.classList.remove("active");
    }

    if (cartBtn) cartBtn.addEventListener("click", openCart);
    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

    // Add to Cart Buttons
    const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
    addToCartBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".product-card");
            if (!card) return;

            const title = card.querySelector(".product-title")?.innerText || "Item";
            const priceText = card.querySelector(".price")?.innerText || "0";
            const imgSrc = card.querySelector(".product-img")?.src || "";

            // Extracts numeric price value
            const numericPrice = parseInt(priceText.replace(/[^0-9]/g, "")) || 0;

            const existingItem = cart.find((item) => item.title === title);
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({
                    title: title,
                    price: numericPrice,
                    img: imgSrc,
                    qty: 1
                });
            }

            saveAndRenderCart();
            showToast(`Added "${title}" to cart!`);
        });
    });

    function saveAndRenderCart() {
        localStorage.setItem("so_fresh_cart", JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

        if (cartBadge) cartBadge.innerText = totalItems;
        if (cartCountHeader) cartCountHeader.innerText = totalItems;
        if (cartTotalAmount) cartTotalAmount.innerText = `₦${totalPrice.toLocaleString()}`;

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="empty-cart-msg">Your cart is currently empty.</p>`;
            return;
        }

        cartItemsContainer.innerHTML = cart
            .map(
                (item, index) => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">₦${(item.price * item.qty).toLocaleString()}</div>
                    <div class="cart-qty-controls">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" onclick="removeItem(${index})" title="Remove">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `
            )
            .join("");
    }

    window.changeQty = function (index, change) {
        if (cart[index]) {
            cart[index].qty += change;
            if (cart[index].qty <= 0) {
                cart.splice(index, 1);
            }
            saveAndRenderCart();
        }
    };

    window.removeItem = function (index) {
        if (cart[index]) {
            cart.splice(index, 1);
            saveAndRenderCart();
        }
    };

   // --- FIXED WHATSAPP CHECKOUT ---
    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Your cart is empty. Please add items before checking out!");
                return;
            }

            // Build plain message text using standard newlines (\n)
            let messageText = "Hello SO FRES# LUXURY,\n\nI would like to place an order for the following items:\n\n";
            let total = 0;

            cart.forEach((item, i) => {
                const subtotal = item.price * item.qty;
                total += subtotal;
                messageText += `${i + 1}. *${item.title}* (x${item.qty}) - ₦${subtotal.toLocaleString()}\n`;
            });

            messageText += `\n*Total Amount:* ₦${total.toLocaleString()}\n\nPlease process my order!`;

            // encodeURIComponent fixes '#' so the full list sends to WhatsApp
            const encodedText = encodeURIComponent(messageText);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

            window.open(whatsappUrl, "_blank");
        });
    }

    function showToast(message) {
        if (!toast) return;
        toast.innerText = message;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    updateCartUI();

    // ==========================================
    // 2. CONTACT & INQUIRY FORM VALIDATION
    // ==========================================
    const contactForm = document.getElementById("contactForm");
    const newsletterForm = document.getElementById("newsletterForm");
    const successModal = document.getElementById("successModal");
    const closeModal = document.getElementById("closeModal");
    const modalOkBtn = document.getElementById("modalOkBtn");

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Stop default HTML submission / page reload

            let isValid = true;

            // Inputs
            const fullName = document.getElementById("fullName");
            const email = document.getElementById("email");
            const phone = document.getElementById("phone");
            const message = document.getElementById("message");

            // Error Elements
            const nameError = document.getElementById("nameError");
            const emailError = document.getElementById("emailError");
            const phoneError = document.getElementById("phoneError");
            const messageError = document.getElementById("messageError");

            // Regular Expressions
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[\d\s\+\-\(\)]{7,}$/;

            // 1. Full Name Validation
            if (!fullName.value.trim() || fullName.value.trim().length < 2) {
                showFieldError(fullName, nameError);
                isValid = false;
            } else {
                clearFieldError(fullName, nameError);
            }

            // 2. Email Validation
            if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
                showFieldError(email, emailError);
                isValid = false;
            } else {
                clearFieldError(email, emailError);
            }

            // 3. Phone Validation
            if (!phone.value.trim() || !phoneRegex.test(phone.value.trim())) {
                showFieldError(phone, phoneError);
                isValid = false;
            } else {
                clearFieldError(phone, phoneError);
            }

            // 4. Message Validation
            if (!message.value.trim() || message.value.trim().length < 10) {
                showFieldError(message, messageError);
                isValid = false;
            } else {
                clearFieldError(message, messageError);
            }

        // If form passes validation
if (isValid) {
    // 1. Gather input values
    const nameVal = fullName.value.trim();
    const emailVal = email.value.trim();
    const phoneVal = phone.value.trim();
    const msgVal = message.value.trim();

    // 2. Set your WhatsApp number (include country code, e.g. 234 for Nigeria)
    const whatsappNumber = "2348106205953"; // REPLACE WITH YOUR 

    // 3. Format WhatsApp message
    const formattedMessage = `*New Store Inquiry*\n\n` +
                             `*Name:* ${nameVal}\n` +
                             `*Email:* ${emailVal}\n` +
                             `*Phone:* ${phoneVal}\n` +
                             `*Message:* ${msgVal}`;

    // 4. Open WhatsApp in a new tab
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(whatsappUrl, "_blank");

    // 5. Show Success Modal
    if (successModal) {
        document.getElementById("modalTitle").innerText = "Inquiry Received!";
        document.getElementById("modalMessage").innerText = `Thank you ${nameVal}, your inquiry has been sent to our WhatsApp.`;
        successModal.classList.add("active");
    }

    contactForm.reset();
}
        });
    }

    // Newsletter Form Validation
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const newsletterEmail = document.getElementById("newsletterEmail");
            const newsletterError = document.getElementById("newsletterError");
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!newsletterEmail.value.trim() || !emailRegex.test(newsletterEmail.value.trim())) {
                showFieldError(newsletterEmail, newsletterError);
            } else {
                clearFieldError(newsletterEmail, newsletterError);
                showToast("Successfully subscribed to VIP drops!");
                newsletterForm.reset();
            }
        });
    }

    // Modal Helpers
    function showFieldError(input, errorElement) {
        if (input) input.classList.add("invalid-input");
        if (errorElement) errorElement.classList.add("active");
    }

    function clearFieldError(input, errorElement) {
        if (input) input.classList.remove("invalid-input");
        if (errorElement) errorElement.classList.remove("active");
    }

    // Modal Closing Listeners
    if (closeModal) {
        closeModal.addEventListener("click", () => successModal.classList.remove("active"));
    }
    if (modalOkBtn) {
        modalOkBtn.addEventListener("click", () => successModal.classList.remove("active"));
    }
});