/**
 * Contact Form JavaScript Module
 * Handles form validation, submission, and UI feedback
 * 
 * @version 1.0.0
 * @author Senior Frontend Developer
 */

(function() {
    'use strict';

    // ========================================
    // Configuration
    // ========================================
    const CONFIG = {
        // Debug mode - set to false in production
        DEBUG: true,
        
        // Telegram Bot Configuration
        // Получите токен бота у @BotFather в Telegram
        TELEGRAM_BOT_TOKEN: '8237970465:AAHOI75Ok9_jZ_sQLBy1vLukaG7U2v3S6oI', // Вставьте ваш токен бота здесь
        TELEGRAM_CHAT_ID: '741707373',   // Вставьте ваш chat_id или ID канала (начинается с @ для каналов)
        
        // API endpoint (replace with actual backend URL)
        API_ENDPOINT: '/api/contact',
        
        // Simulation delay for demo purposes (ms)
        SIMULATION_DELAY: 2000,
        
        // Toast auto-dismiss time (ms)
        TOAST_DISMISS_TIME: 5000,
        
        // Debounce delay for validation (ms)
        DEBOUNCE_DELAY: 300,
        
        // Character counter update interval (ms)
        COUNTER_UPDATE_INTERVAL: 100
    };

    // ========================================
    // DOM Elements Cache
    // ========================================
    const elements = {
        form: null,
        fields: {
            name: null,
            email: null,
            message: null
        },
        errors: {
            name: null,
            email: null,
            message: null
        },
        submitBtn: null,
        btnText: null,
        btnLoading: null,
        formStatus: null,
        successMessage: null,
        errorMessage: null,
        messageCounter: null,
        toastContainer: null
    };

    // ========================================
    // State Management
    // ========================================
    const state = {
        isSubmitting: false,
        validationErrors: {},
        formValid: false
    };

    // ========================================
    // Utility Functions
    // ========================================

    /**
     * Log messages to console in debug mode only
     * @param {...any} args - Arguments to log
     */
    function debugLog(...args) {
        if (CONFIG.DEBUG) {
            console.log('[ContactForm]', ...args);
        }
    }

    /**
     * Debounce function to limit rapid successive calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Validate email format using regex
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Sanitize input string to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    function sanitizeInput(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ========================================
    // Validation Logic
    // ========================================

    /**
     * Validation rules for each field
     */
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/,
            messages: {
                required: 'Имя обязательно для заполнения',
                minLength: 'Имя должно содержать минимум 2 символа',
                maxLength: 'Имя не должно превышать 50 символов',
                pattern: 'Имя может содержать только буквы, пробелы, дефисы и апострофы'
            }
        },
        email: {
            required: true,
            maxLength: 100,
            messages: {
                required: 'Email обязателен для заполнения',
                invalid: 'Введите корректный email адрес',
                maxLength: 'Email не должен превышать 100 символов'
            }
        },
        message: {
            required: true,
            minLength: 10,
            maxLength: 1000,
            messages: {
                required: 'Сообщение обязательно для заполнения',
                minLength: 'Сообщение должно содержать минимум 10 символов',
                maxLength: 'Сообщение не должно превышать 1000 символов'
            }
        }
    };

    /**
     * Validate a single field
     * @param {string} fieldName - Name of the field to validate
     * @param {string} value - Value to validate
     * @returns {Object} Validation result { isValid, error }
     */
    function validateField(fieldName, value) {
        const rules = validationRules[fieldName];
        if (!rules) return { isValid: true, error: '' };

        const trimmedValue = value.trim();

        // Check required
        if (rules.required && !trimmedValue) {
            return { isValid: false, error: rules.messages.required };
        }

        // Skip further validation if empty and not required
        if (!trimmedValue) {
            return { isValid: true, error: '' };
        }

        // Check minLength
        if (rules.minLength && trimmedValue.length < rules.minLength) {
            return { isValid: false, error: rules.messages.minLength };
        }

        // Check maxLength
        if (rules.maxLength && trimmedValue.length > rules.maxLength) {
            return { isValid: false, error: rules.messages.maxLength };
        }

        // Check pattern (for name field)
        if (rules.pattern && !rules.pattern.test(trimmedValue)) {
            return { isValid: false, error: rules.messages.pattern };
        }

        // Check email format
        if (fieldName === 'email' && !isValidEmail(trimmedValue)) {
            return { isValid: false, error: rules.messages.invalid };
        }

        return { isValid: true, error: '' };
    }

    /**
     * Validate all form fields
     * @returns {boolean} True if all fields are valid
     */
    function validateForm() {
        let isFormValid = true;
        state.validationErrors = {};

        Object.keys(elements.fields).forEach(fieldName => {
            const field = elements.fields[fieldName];
            const value = field?.value || '';
            const result = validateField(fieldName, value);

            if (!result.isValid) {
                isFormValid = false;
                state.validationErrors[fieldName] = result.error;
            }
        });

        state.formValid = isFormValid;
        return isFormValid;
    }

    // ========================================
    // UI Update Functions
    // ========================================

    /**
     * Show error message for a field
     * @param {string} fieldName - Name of the field
     * @param {string} message - Error message to display
     */
    function showFieldError(fieldName, message) {
        const field = elements.fields[fieldName];
        const errorEl = elements.errors[fieldName];

        if (field && errorEl) {
            field.setAttribute('aria-invalid', 'true');
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
    }

    /**
     * Hide error message for a field
     * @param {string} fieldName - Name of the field
     */
    function hideFieldError(fieldName) {
        const field = elements.fields[fieldName];
        const errorEl = elements.errors[fieldName];

        if (field && errorEl) {
            field.setAttribute('aria-invalid', 'false');
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
        }
    }

    /**
     * Clear all field errors
     */
    function clearAllErrors() {
        Object.keys(elements.errors).forEach(fieldName => {
            hideFieldError(fieldName);
        });
    }

    /**
     * Update character counter for message field
     */
    function updateMessageCounter() {
        const messageField = elements.fields.message;
        const counterEl = elements.messageCounter?.querySelector('.current-chars');
        
        if (messageField && counterEl) {
            const currentLength = messageField.value.length;
            counterEl.textContent = currentLength;
            
            // Visual feedback when approaching limit
            if (currentLength > 900) {
                counterEl.classList.add('text-red-500');
            } else {
                counterEl.classList.remove('text-red-500');
            }
        }
    }

    /**
     * Set form loading state
     * @param {boolean} isLoading - Whether form is in loading state
     */
    function setLoadingState(isLoading) {
        state.isSubmitting = isLoading;

        if (elements.submitBtn) {
            elements.submitBtn.disabled = isLoading;
            elements.submitBtn.setAttribute('aria-busy', isLoading.toString());
        }

        if (elements.btnText && elements.btnLoading) {
            if (isLoading) {
                elements.btnText.classList.add('hidden');
                elements.btnLoading.classList.remove('hidden');
                elements.btnLoading.style.display = 'flex';
            } else {
                elements.btnText.classList.remove('hidden');
                elements.btnLoading.classList.add('hidden');
                elements.btnLoading.style.display = 'none';
            }
        }
    }

    /**
     * Show form status message
     * @param {'success' | 'error'} type - Type of status message
     */
    function showFormStatus(type) {
        if (!elements.formStatus) return;

        elements.formStatus.classList.remove('hidden');
        
        if (type === 'success') {
            elements.successMessage?.classList.remove('hidden');
            elements.successMessage?.style.setProperty('display', 'flex');
            elements.errorMessage?.classList.add('hidden');
            elements.errorMessage?.style.setProperty('display', 'none');
        } else {
            elements.errorMessage?.classList.remove('hidden');
            elements.errorMessage?.style.setProperty('display', 'flex');
            elements.successMessage?.classList.add('hidden');
            elements.successMessage?.style.setProperty('display', 'none');
        }
    }

    /**
     * Hide form status message
     */
    function hideFormStatus() {
        if (elements.formStatus) {
            elements.formStatus.classList.add('hidden');
            elements.successMessage?.classList.add('hidden');
            elements.errorMessage?.classList.add('hidden');
        }
    }

    // ========================================
    // Toast Notification System
    // ========================================

    /**
     * Create and show a toast notification
     * @param {string} message - Message to display
     * @param {'success' | 'error' | 'info'} type - Type of toast
     */
    function showToast(message, type = 'info') {
        if (!elements.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `
            pointer-events-auto
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
            transform transition-all duration-300 ease-out
            toast-enter max-w-sm w-full
            ${type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : ''}
            ${type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' : ''}
            ${type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : ''}
        `;

        const iconMap = {
            success: '<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
            error: '<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
            info: '<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
        };

        toast.innerHTML = `
            ${iconMap[type] || iconMap.info}
            <span class="text-sm font-medium">${sanitizeInput(message)}</span>
        `;

        elements.toastContainer.appendChild(toast);

        // Auto dismiss after timeout
        setTimeout(() => {
            dismissToast(toast);
        }, CONFIG.TOAST_DISMISS_TIME);
    }

    /**
     * Dismiss a toast notification
     * @param {HTMLElement} toast - Toast element to dismiss
     */
    function dismissToast(toast) {
        if (!toast || !elements.toastContainer) return;

        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');

        toast.addEventListener('animationend', () => {
            toast.remove();
        }, { once: true });
    }

    // ========================================
    // Form Submission Handler
    // ========================================

    /**
     * Send form data to Telegram Bot API
     * @param {Object} formData - Form data to submit
     * @returns {Promise<Object>} Response data
     */
    async function sendToTelegram(formData) {
        if (!CONFIG.TELEGRAM_BOT_TOKEN || !CONFIG.TELEGRAM_CHAT_ID) {
            debugLog('⚠️ Telegram credentials not configured. Using simulation mode.');
            return simulateApiRequest(formData);
        }

        const message = `
📨 <b>Новое обращение с сайта ARB TECH</b>

👤 <b>Имя:</b> ${formData.name}
📧 <b>Email:</b> ${formData.email}
💬 <b>Сообщение:</b> ${formData.message}

🕒 <b>Дата:</b> ${new Date(formData.timestamp).toLocaleString('ru-RU')}
        `.trim();

        const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: CONFIG.TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            const result = await response.json();

            if (result.ok) {
                debugLog('✅ Message sent to Telegram:', result.result);
                return { 
                    success: true, 
                    message: 'Сообщение отправлено',
                    timestamp: formData.timestamp
                };
            } else {
                debugLog('❌ Telegram API error:', result);
                throw new Error(result.description || 'Telegram API error');
            }
        } catch (error) {
            debugLog('❌ Failed to send to Telegram:', error);
            throw error;
        }
    }

    /**
     * Simulate API request (replace with actual fetch in production)
     * @param {Object} formData - Form data to submit
     * @returns {Promise<Object>} Response data
     */
    function simulateApiRequest(formData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate for demo
                const isSuccess = Math.random() > 0.1;
                
                if (isSuccess) {
                    debugLog('✅ Form submitted successfully:', formData);
                    resolve({ 
                        success: true, 
                        message: 'Сообщение отправлено',
                        timestamp: new Date().toISOString()
                    });
                } else {
                    debugLog('❌ Form submission failed');
                    reject(new Error('Network error'));
                }
            }, CONFIG.SIMULATION_DELAY);
        });
    }

    /**
     * Handle form submission
     * @param {Event} event - Submit event
     */
    async function handleSubmit(event) {
        event.preventDefault();

        // Prevent duplicate submissions
        if (state.isSubmitting) {
            debugLog('⚠️ Submission already in progress');
            return;
        }

        debugLog('📝 Form submission initiated');

        // Validate form
        if (!validateForm()) {
            debugLog('❌ Validation failed:', state.validationErrors);
            
            // Show errors for invalid fields
            Object.entries(state.validationErrors).forEach(([fieldName, error]) => {
                showFieldError(fieldName, error);
            });

            showToast('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }

        // Clear previous errors
        clearAllErrors();
        hideFormStatus();

        // Set loading state
        setLoadingState(true);

        try {
            // Gather form data
            const formData = {
                name: sanitizeInput(elements.fields.name.value.trim()),
                email: sanitizeInput(elements.fields.email.value.trim()),
                message: sanitizeInput(elements.fields.message.value.trim()),
                timestamp: new Date().toISOString()
            };

            debugLog('📤 Sending data:', formData);

            // Submit to Telegram or simulate
            const response = await sendToTelegram(formData);

            debugLog('✅ Server response:', response);

            // Show success state
            showFormStatus('success');
            showToast('Сообщение успешно отправлено!', 'success');

            // Reset form
            resetForm();

        } catch (error) {
            debugLog('❌ Submission error:', error);

            // Show error state
            showFormStatus('error');
            showToast('Произошла ошибка при отправке', 'error');

            // Keep form data for retry
        } finally {
            // Reset loading state
            setLoadingState(false);
        }
    }

    /**
     * Reset form to initial state
     */
    function resetForm() {
        if (elements.form) {
            elements.form.reset();
        }

        // Reset validation states
        clearAllErrors();
        updateMessageCounter();

        // Hide success message after delay
        setTimeout(() => {
            hideFormStatus();
        }, 5000);
    }

    // ========================================
    // Event Listeners Setup
    // ========================================

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        // Form submit handler
        elements.form?.addEventListener('submit', handleSubmit);

        // Real-time validation on blur
        Object.keys(elements.fields).forEach(fieldName => {
            const field = elements.fields[fieldName];
            
            if (field) {
                // Validate on blur
                field.addEventListener('blur', () => {
                    const result = validateField(fieldName, field.value);
                    
                    if (!result.isValid) {
                        showFieldError(fieldName, result.error);
                    } else {
                        hideFieldError(fieldName);
                    }
                });

                // Clear error on input (debounced)
                const debouncedHideError = debounce(() => {
                    hideFieldError(fieldName);
                }, CONFIG.DEBOUNCE_DELAY);

                field.addEventListener('input', debouncedHideError);
            }
        });

        // Character counter for message field
        elements.fields.message?.addEventListener('input', updateMessageCounter);

        // Keyboard accessibility - allow Enter to submit from any field
        Object.values(elements.fields).forEach(field => {
            field?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    elements.form?.requestSubmit();
                }
            });
        });
    }

    // ========================================
    // Scroll Reveal Animation
    // ========================================

    /**
     * Initialize scroll reveal animations using Intersection Observer
     */
    function initScrollReveal() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without Intersection Observer
            document.querySelectorAll('.scroll-reveal').forEach(el => {
                el.classList.add('revealed');
            });
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });
    }

    // ========================================
    // Initialization
    // ========================================

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.form = document.getElementById('contact-form');
        elements.fields.name = document.getElementById('name');
        elements.fields.email = document.getElementById('email');
        elements.fields.message = document.getElementById('message');
        elements.errors.name = document.getElementById('name-error');
        elements.errors.email = document.getElementById('email-error');
        elements.errors.message = document.getElementById('message-error');
        elements.submitBtn = document.getElementById('submit-btn');
        elements.btnText = elements.submitBtn?.querySelector('.btn-text');
        elements.btnLoading = elements.submitBtn?.querySelector('.btn-loading');
        elements.formStatus = document.getElementById('form-status');
        elements.successMessage = document.getElementById('success-message');
        elements.errorMessage = document.getElementById('error-message');
        elements.messageCounter = document.getElementById('message-counter');
        elements.toastContainer = document.getElementById('toast-container');
    }

    /**
     * Initialize the contact form module
     */
    function init() {
        debugLog('🚀 Initializing Contact Form Module...');

        // Cache DOM elements
        cacheElements();

        // Verify critical elements exist
        if (!elements.form) {
            console.error('[ContactForm] Critical: Form element not found');
            return;
        }

        // Initialize event listeners
        initEventListeners();

        // Initialize scroll animations
        initScrollReveal();

        // Initial character counter update
        updateMessageCounter();

        debugLog('✅ Contact Form Module initialized successfully');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
