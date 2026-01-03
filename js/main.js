/**
 * Oil Painting Commission Form
 * Multi-step form with validation, conditional fields, and file upload
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('commissionForm');
    const progressSteps = document.querySelectorAll('.progress-step');
    const formSteps = document.querySelectorAll('.form-step');

    let currentStep = 1;
    let uploadedFiles = [];

    // ============================================
    // NAVIGATION
    // ============================================

    // Next button handlers
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
    });

    // Back button handlers
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            goToStep(currentStep - 1);
        });
    });

    function goToStep(step) {
        // Update progress bar
        progressSteps.forEach((ps, index) => {
            ps.classList.remove('active', 'completed');
            if (index + 1 < step) {
                ps.classList.add('completed');
            } else if (index + 1 === step) {
                ps.classList.add('active');
            }
        });

        // Update form steps
        formSteps.forEach(fs => {
            fs.classList.remove('active');
            if (parseInt(fs.dataset.step) === step || fs.dataset.step === 'success') {
                if (parseInt(fs.dataset.step) === step) {
                    fs.classList.add('active');
                }
            }
        });

        currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================
    // VALIDATION
    // ============================================

    function validateStep(step) {
        let isValid = true;
        const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);

        // Clear previous errors
        stepElement.querySelectorAll('.field-error').forEach(err => {
            err.classList.remove('visible');
            err.textContent = '';
        });
        stepElement.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
            input.classList.remove('error');
        });

        // Validate required fields in current step
        const requiredFields = stepElement.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (field.type === 'radio') {
                // Check if any radio in group is selected
                const name = field.name;
                const radioGroup = stepElement.querySelectorAll(`input[name="${name}"]`);
                const anyChecked = Array.from(radioGroup).some(r => r.checked);

                if (!anyChecked) {
                    isValid = false;
                    showError(name, 'Please select an option');
                }
            } else if (field.type === 'checkbox') {
                if (!field.checked) {
                    isValid = false;
                    showError(field.name, 'This field is required');
                }
            } else if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                showError(field.name || field.id, 'This field is required');
            }
        });

        // Email validation
        const emailField = stepElement.querySelector('input[type="email"]');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                isValid = false;
                emailField.classList.add('error');
                showError('email', 'Please enter a valid email address');
            }
        }

        // Phone validation (if provided)
        const phoneField = stepElement.querySelector('input[type="tel"]');
        if (phoneField && phoneField.value) {
            const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
            if (!phoneRegex.test(phoneField.value)) {
                isValid = false;
                phoneField.classList.add('error');
                showError('phone', 'Please enter a valid phone number');
            }
        }

        // Step 3: Check for at least one photo
        if (step === 3 && uploadedFiles.length === 0) {
            isValid = false;
            showError('photos', 'Please upload at least one reference photo');
        }

        return isValid;
    }

    function showError(fieldName, message) {
        const errorElement = document.querySelector(`[data-error="${fieldName}"]`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        }
    }

    // ============================================
    // CONDITIONAL FIELDS
    // ============================================

    // Project type conditionals
    document.querySelectorAll('input[name="project_type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const subjectField = document.querySelector('[data-show-if="portrait_family,portrait_couple"]');
            if (this.value === 'portrait_family' || this.value === 'portrait_couple') {
                subjectField.classList.add('visible');
            } else {
                subjectField.classList.remove('visible');
            }
        });
    });

    // Canvas size conditional
    document.querySelectorAll('input[name="canvas_size"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const customField = document.querySelector('[data-show-if-size="custom"]');
            if (this.value === 'custom') {
                customField.classList.add('visible');
            } else {
                customField.classList.remove('visible');
            }
        });
    });

    // Color preference conditional
    document.querySelectorAll('input[name="color_pref[]"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const roomField = document.querySelector('[data-show-if-color="match_room"]');
            const matchRoomChecked = document.querySelector('input[name="color_pref[]"][value="match_room"]').checked;
            if (matchRoomChecked) {
                roomField.classList.add('visible');
            } else {
                roomField.classList.remove('visible');
            }
        });
    });

    // Background preference conditional
    const bgSelect = document.querySelector('select[name="background_pref"]');
    if (bgSelect) {
        bgSelect.addEventListener('change', function() {
            const detailsField = document.querySelector('[data-show-if-bg="custom_setting"]');
            if (this.value === 'custom_setting') {
                detailsField.classList.add('visible');
            } else {
                detailsField.classList.remove('visible');
            }
        });
    }

    // Timeline conditional
    const timelineSelect = document.querySelector('select[name="timeline"]');
    if (timelineSelect) {
        timelineSelect.addEventListener('change', function() {
            const dateField = document.querySelector('[data-show-if-timeline="specific_date"]');
            if (this.value === 'specific_date') {
                dateField.classList.add('visible');
            } else {
                dateField.classList.remove('visible');
            }
        });
    }

    // Referral conditional
    const referralSelect = document.querySelector('select[name="referral_source"]');
    if (referralSelect) {
        referralSelect.addEventListener('change', function() {
            const nameField = document.querySelector('[data-show-if-referral="friend_family"]');
            if (this.value === 'friend_family') {
                nameField.classList.add('visible');
            } else {
                nameField.classList.remove('visible');
            }
        });
    }

    // ============================================
    // FILE UPLOAD
    // ============================================

    const uploadZone = document.getElementById('uploadZone');
    const uploadInput = document.getElementById('photo_upload');
    const uploadPreview = document.getElementById('uploadPreview');

    if (uploadZone && uploadInput) {
        // Click to upload
        uploadZone.addEventListener('click', () => uploadInput.click());

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        // File input change
        uploadInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
    }

    function handleFiles(files) {
        const validTypes = ['image/jpeg', 'image/png', 'image/heic'];
        const maxSize = 25 * 1024 * 1024; // 25MB
        const maxFiles = 10;

        Array.from(files).forEach(file => {
            // Check file count
            if (uploadedFiles.length >= maxFiles) {
                alert(`Maximum ${maxFiles} files allowed`);
                return;
            }

            // Check file type
            if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
                alert(`Invalid file type: ${file.name}. Please use JPG, PNG, or HEIC.`);
                return;
            }

            // Check file size
            if (file.size > maxSize) {
                alert(`File too large: ${file.name}. Maximum size is 25MB.`);
                return;
            }

            // Add to array and create preview
            uploadedFiles.push(file);
            createPreview(file, uploadedFiles.length - 1);
        });

        // Show/hide multiple photo selector
        updatePhotoSelector();
    }

    function createPreview(file, index) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.dataset.index = index;

        const img = document.createElement('img');
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'preview-remove';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFile(index);
        });

        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        uploadPreview.appendChild(previewItem);
    }

    function removeFile(index) {
        uploadedFiles.splice(index, 1);

        // Rebuild preview
        uploadPreview.innerHTML = '';
        uploadedFiles.forEach((file, i) => {
            createPreview(file, i);
        });

        updatePhotoSelector();
    }

    function updatePhotoSelector() {
        const multiPhotoField = document.querySelector('[data-show-if-multiple-photos]');
        if (multiPhotoField) {
            if (uploadedFiles.length > 1) {
                multiPhotoField.classList.add('visible');
            } else {
                multiPhotoField.classList.remove('visible');
            }
        }
    }

    // ============================================
    // FORM SUBMISSION
    // ============================================

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateStep(currentStep)) {
            return;
        }

        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Collect form data
        const formData = new FormData(form);

        // Add uploaded files
        uploadedFiles.forEach((file, index) => {
            formData.append(`photo_${index}`, file);
        });

        try {
            // In production, replace with actual endpoint
            // const response = await fetch('/api/commission', {
            //     method: 'POST',
            //     body: formData
            // });

            // Simulate submission for demo
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success
            const email = formData.get('email');
            document.getElementById('confirmEmail').textContent = email;

            // Hide all steps, show success
            formSteps.forEach(fs => fs.classList.remove('active'));
            document.querySelector('[data-step="success"]').classList.add('active');

            // Update progress bar
            progressSteps.forEach(ps => ps.classList.add('completed'));

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Submission error:', error);
            alert('There was an error submitting your request. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Commission Request';
        }
    });

    // ============================================
    // INPUT FORMATTING
    // ============================================

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 10) {
                value = value.substring(0, 10);
                value = `(${value.substring(0,3)}) ${value.substring(3,6)}-${value.substring(6)}`;
            }
            e.target.value = value;
        });
    }

    // Set minimum date for deadline to today
    const deadlineInput = document.getElementById('deadline_date');
    if (deadlineInput) {
        const today = new Date().toISOString().split('T')[0];
        deadlineInput.setAttribute('min', today);
    }

    // ============================================
    // REAL-TIME VALIDATION
    // ============================================

    // Clear error on input
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorElement = document.querySelector(`[data-error="${this.name || this.id}"]`);
            if (errorElement) {
                errorElement.classList.remove('visible');
            }
        });
    });

    // Clear radio/checkbox errors on change
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', function() {
            const errorElement = document.querySelector(`[data-error="${this.name}"]`);
            if (errorElement) {
                errorElement.classList.remove('visible');
            }
        });
    });

});
