if (document.title === "BloodHound") {
    let currentQueryIndex = -1;
    let hasLoadedInitialQuery = false;
    let isNavigating = false;
    let lastUrl = window.location.href;
    let hasAddedCypherListener = false;
    let hasShownDonationPopup = false;
    let hasAddedNeo4jLink = false;

    // Function to apply all UI changes at once
    function applyAllChanges() {
        checkForCypherQuery();
        checkForRunButton();
        addNavigationButtons();
        addNeo4jLink();
        removeUnwantedElement();
        // Width adjustment disabled due to UI issues
        // adjustContainerWidth();
        
        // Show donation popup after a delay if not shown before or if the 2-week period has expired
        const popupShownUntil = localStorage.getItem('donation_popup_shown_until');
        const shouldShowPopup = !popupShownUntil || new Date() > new Date(popupShownUntil);
        
        if (!hasShownDonationPopup && shouldShowPopup) {
            setTimeout(showDonationPopup, 5000);
        }
    }

    // Function to show donation popup
    function showDonationPopup() {
        if (hasShownDonationPopup) return;
        
        // Create popup container
        const popupContainer = document.createElement('div');
        popupContainer.style.position = 'fixed';
        popupContainer.style.bottom = '20px';
        popupContainer.style.right = '20px';
        popupContainer.style.width = '320px';
        popupContainer.style.backgroundColor = '#ffffff';
        popupContainer.style.borderRadius = '8px';
        popupContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        popupContainer.style.zIndex = '9999';
        popupContainer.style.padding = '16px';
        popupContainer.style.display = 'flex';
        popupContainer.style.flexDirection = 'column';
        popupContainer.style.gap = '12px';
        popupContainer.style.border = '1px solid #e0e0e0';
        
        // Create header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        
        const title = document.createElement('h3');
        title.textContent = 'Support BloodHound Viewer';
        title.style.margin = '0';
        title.style.fontSize = '18px';
        title.style.fontWeight = 'bold';
        title.style.color = '#333';
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0';
        closeButton.style.lineHeight = '1';
        closeButton.style.color = '#666';
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Create content
        const content = document.createElement('div');
        content.innerHTML = `
            <p style="margin: 0 0 12px; color: #555; font-size: 14px;">
                If you find this extension useful, please consider supporting its development.
            </p>
        `;
        
        // Create donation buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.flexDirection = 'column';
        buttonsContainer.style.gap = '8px';
        
        // PayPal button
        const paypalButton = document.createElement('a');
        paypalButton.href = 'https://www.paypal.com/donate/?hosted_button_id=QWKQ9Q4Y493J2';
        paypalButton.target = '_blank';
        paypalButton.style.backgroundColor = '#0070ba';
        paypalButton.style.color = '#ffffff';
        paypalButton.style.padding = '10px 16px';
        paypalButton.style.borderRadius = '4px';
        paypalButton.style.textDecoration = 'none';
        paypalButton.style.fontWeight = 'bold';
        paypalButton.style.fontSize = '14px';
        paypalButton.style.display = 'flex';
        paypalButton.style.alignItems = 'center';
        paypalButton.style.justifyContent = 'center';
        paypalButton.style.gap = '8px';
        paypalButton.innerHTML = `Donate with PayPal`;
        
        // Buy Me A Coffee button
        const coffeeButton = document.createElement('a');
        coffeeButton.href = 'https://buymeacoffee.com/mordavid';
        coffeeButton.target = '_blank';
        coffeeButton.style.backgroundColor = '#FFDD00';
        coffeeButton.style.color = '#000000';
        coffeeButton.style.padding = '10px 16px';
        coffeeButton.style.borderRadius = '4px';
        coffeeButton.style.textDecoration = 'none';
        coffeeButton.style.fontWeight = 'bold';
        coffeeButton.style.fontSize = '14px';
        coffeeButton.style.display = 'flex';
        coffeeButton.style.alignItems = 'center';
        coffeeButton.style.justifyContent = 'center';
        coffeeButton.style.gap = '8px';
        coffeeButton.innerHTML = `Buy Me A Coffee`;
        
        // Don't show again checkbox
        const checkboxContainer = document.createElement('div');
        checkboxContainer.style.display = 'flex';
        checkboxContainer.style.alignItems = 'center';
        checkboxContainer.style.marginTop = '8px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'dont-show-again';
        checkbox.style.marginRight = '8px';
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = 'dont-show-again';
        checkboxLabel.textContent = "Don't show this again";
        checkboxLabel.style.fontSize = '13px';
        checkboxLabel.style.color = '#666';
        
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(checkboxLabel);
        
        // Add elements to DOM
        buttonsContainer.appendChild(paypalButton);
        buttonsContainer.appendChild(coffeeButton);
        
        popupContainer.appendChild(header);
        popupContainer.appendChild(content);
        popupContainer.appendChild(buttonsContainer);
        popupContainer.appendChild(checkboxContainer);
        
        document.body.appendChild(popupContainer);
        
        // Event handlers
        closeButton.addEventListener('click', () => {
            if (checkbox.checked) {
                const twoWeeksFromNow = new Date();
                twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
                localStorage.setItem('donation_popup_shown_until', twoWeeksFromNow.toISOString());
            }
            popupContainer.remove();
        });
        
        hasShownDonationPopup = true;
    }

    // Function to handle Cypher tab click
    function handleCypherTabClick() {
        const tabButtons = Array.from(document.querySelectorAll('button[role="tab"]'));
        const cypherTab = tabButtons.find(tab => tab.title === "Cypher" || tab.textContent?.includes("Cypher"));
        
        if (cypherTab && !hasAddedCypherListener) {
            cypherTab.addEventListener('click', () => {
                hasLoadedInitialQuery = false;
                // Reduced timeout to 50ms
                setTimeout(applyAllChanges, 50);
            });
            hasAddedCypherListener = true;
            return true;
        }
        return false;
    }

    // Check for Cypher tab with shorter interval, stop when found
    const cypherTabCheckInterval = setInterval(() => {
        if (handleCypherTabClick()) {
            clearInterval(cypherTabCheckInterval);
        }
    }, 100);

    // Create a MutationObserver to watch for URL changes
    const urlObserver = new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            
            // Always try to add Neo4j link when URL changes
            if (!hasAddedNeo4jLink) {
                addNeo4jLink();
            }
            
            if (currentUrl.includes('ui/explore')) {
                hasLoadedInitialQuery = false;
                // Reduced timeout to 50ms
                setTimeout(applyAllChanges, 50);
            }
        }
    });

    // Start observing
    urlObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    async function addNavigationButtons() {
        // Find the Run button with the enhanced detection
        const runButtons = Array.from(document.querySelectorAll('button'));
        const runButton = runButtons.find(btn => {
            const text = btn.textContent || '';
            // Match either text containing "Run" or a play icon
            return (text.includes('Run') && 
                   (btn.querySelector('.fa-play') !== null || 
                    btn.innerHTML.includes('play') || 
                    btn.innerHTML.includes('svg')));
        });

        // Check if buttons already exist
        if (runButton && !document.querySelector('[data-nav-buttons="true"]')) {
            // Find a good parent container for the navigation buttons
            let buttonContainer;
            
            // For newer BloodHound UI (as in screenshot)
            const newUIParent = runButton.parentNode;
            if (newUIParent) {
                // Create button container that matches UI style
                buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.gap = '5px';
                buttonContainer.style.marginRight = '8px';
                
                // Create buttons with appropriate styling
                const backButton = document.createElement('button');
                backButton.className = runButton.className; // Copy styling from run button
                backButton.innerHTML = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="backward" class="svg-inline--fa fa-backward" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 1em;"><path fill="currentColor" d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3V256v41.7L459.5 440.6zM256 352V256 128 96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V352z"/></svg>';
                backButton.setAttribute('data-nav-buttons', 'true');
                backButton.onclick = () => navigateHistory(-1);
                
                const forwardButton = document.createElement('button');
                forwardButton.className = runButton.className; // Copy styling from run button
                forwardButton.innerHTML = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="forward" class="svg-inline--fa fa-forward" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 1em;"><path fill="currentColor" d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3V256v41.7L52.5 440.6zM256 352V256 128 96c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29V352z"/></svg>';
                forwardButton.setAttribute('data-nav-buttons', 'true');
                forwardButton.onclick = () => navigateHistory(1);
                
                buttonContainer.appendChild(backButton);
                buttonContainer.appendChild(forwardButton);
                
                // Insert buttons before the run button
                newUIParent.insertBefore(buttonContainer, runButton);
                console.log("[+] Added navigation buttons to new UI");
                return;
            }
            
            // Fall back to old approach if new UI layout not detected
            buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '5px';
            buttonContainer.style.alignItems = 'center';
            buttonContainer.style.width = '100%';
            buttonContainer.style.flexWrap = 'nowrap';
            buttonContainer.style.justifyContent = 'flex-end';
            buttonContainer.style.marginBottom = '5px';
            buttonContainer.style.overflow = 'visible';

            // Find and move Save Query button - also using a more robust selector
            const saveButtons = Array.from(document.querySelectorAll('button'));
            const saveQueryButton = saveButtons.find(btn => {
                const text = btn.textContent || '';
                return (text.includes('Save Query') &&
                       (btn.querySelector('.fa-floppy-disk') !== null ||
                        btn.innerHTML.includes('floppy') ||
                        btn.innerHTML.includes('save')));
            });
            
            if (saveQueryButton) {
                saveQueryButton.style.order = '-1';
                buttonContainer.appendChild(saveQueryButton);
            }
			
            const backButton = document.createElement('button');
            backButton.className = "inline-flex items-center justify-center whitespace-nowrap rounded-3xl ring-offset-background transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:no-underline bg-primary text-white shadow-outer-1 hover:bg-secondary h-9 px-4 py-1 text-xs";
            backButton.innerHTML = '<div class="MuiBox-root css-70qvj9"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="backward" class="svg-inline--fa fa-backward" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3V256v41.7L459.5 440.6zM256 352V256 128 96c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V352z"/></svg></div>';
            backButton.setAttribute('data-nav-buttons', 'true');
            backButton.onclick = () => navigateHistory(-1);

            const forwardButton = document.createElement('button');
            forwardButton.className = "inline-flex items-center justify-center whitespace-nowrap rounded-3xl ring-offset-background transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:no-underline bg-primary text-white shadow-outer-1 hover:bg-secondary h-9 px-4 py-1 text-xs";
            forwardButton.innerHTML = '<div class="MuiBox-root css-70qvj9"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="forward" class="svg-inline--fa fa-forward" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3V256v41.7L52.5 440.6zM256 352V256 128 96c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29V352z"/></svg></div>';
            forwardButton.setAttribute('data-nav-buttons', 'true');
            forwardButton.onclick = () => navigateHistory(1);

            buttonContainer.appendChild(backButton);
            buttonContainer.appendChild(forwardButton);

            runButton.parentNode.insertBefore(buttonContainer, runButton);
        }
    }

    function checkForRunButton() {
        // Try to find the Run button with multiple strategies
        const runButtons = Array.from(document.querySelectorAll('button'));
        const runButton = runButtons.find(btn => {
            const text = btn.textContent || '';
            // Match either text containing "Run" or a play icon
            return (text.includes('Run') && 
                   (btn.querySelector('.fa-play') !== null || 
                    btn.innerHTML.includes('play') || 
                    btn.innerHTML.includes('svg')));
        });
        
        if (runButton && !runButton.hasAttribute('data-save-listener')) {
            console.log("[+] Found run button, adding click listener");
            
            // Add click listener with immediate save
            const saveHandler = function(e) {
                console.log("[+] Run button clicked, saving query");
                const text = getQueryText();
                console.log("[+] Current query text:", text);
                
                if (text && text.trim()) {
                    try {
                        const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
                        const queryExists = savedQueries.some(q => q.query === text.trim());
                        
                        if (!queryExists) {
                            const newQuery = {
                                name: `My Query ${savedQueries.length}`,
                                query: text.trim()
                            };
                            savedQueries.push(newQuery);
                            localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
                            currentQueryIndex = savedQueries.length - 1;
                            console.log("[+] Query saved successfully:", newQuery);
                        } else {
                            console.log("[+] Query already exists in history");
                        }
                    } catch (error) {
                        console.error("Error saving query:", error);
                    }
                } else {
                    console.log("[-] No query text to save");
                }
            };
            
            // Remove any existing listeners
            runButton.removeEventListener('click', saveHandler);
            // Add the new listener
            runButton.addEventListener('click', saveHandler);
            
            runButton.setAttribute('data-save-listener', 'true');
            console.log("[+] Run button listener added successfully");
            return true;
        }
        return false;
    }

    function getQueryText() {
        try {
            // Approach 0: Use specific XPath provided
            const specificXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[2]/div/div/div[1]/div/div/div/div[2]/div[2]";
            const specificEditor = document.evaluate(specificXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (specificEditor) {
                // Extract text from all cm-line divs
                const lines = specificEditor.querySelectorAll('.cm-line');
                if (lines.length > 0) {
                    const text = Array.from(lines).map(line => line.textContent).join('\n');
                    console.log("[+] Got query text from specific XPath editor:", text);
                    return text;
                }
                
                // If no cm-lines, get the raw text content
                const text = specificEditor.textContent;
                if (text && text.trim() !== "") {
                    console.log("[+] Got raw text from specific XPath editor:", text);
                    return text;
                }
            }
            
            // Approach 1: Modern editor with role=textbox
            const modernEditor = document.querySelector('[role="textbox"]');
            if (modernEditor) {
                const text = modernEditor.textContent;
                console.log("[+] Got query text from modern editor:", text);
                return text;
            }
            
            // Approach 2: Try CM Editor
            const queryBox = document.querySelector('.cm-editor.cm-cypher');
            if (queryBox) {
                // Try to get text from cm-line divs (formatted query)
                const lines = queryBox.querySelectorAll('.cm-line');
                if (lines.length > 0) {
                    const text = Array.from(lines).map(line => line.textContent).join('\n');
                    console.log("[+] Got query text from CM editor lines:", text);
                    return text;
                }
                
                // Fall back to raw text content
                const text = queryBox.textContent;
                console.log("[+] Got raw query text from CM editor:", text);
                return text;
            }
            
            // Approach 3: Try jss52 editor
            const jssEditor = document.querySelector('.jss52');
            if (jssEditor) {
                const text = jssEditor.textContent;
                console.log("[+] Got query text from jss editor:", text);
                return text;
            }
            
            // Approach 4: Try to find any div containing Cypher-like content
            const allDivs = document.querySelectorAll('div');
            for (const div of allDivs) {
                const text = div.textContent || "";
                if (text.includes("MATCH") && text.includes("RETURN") && text.length > 20) {
                    console.log("[+] Found Cypher-like content in div:", text);
                    return text;
                }
            }
            
            console.log("[-] Could not find the query editor");
            return "";
        } catch (error) {
            console.error("Error getting query text:", error);
            return "";
        }
    }

    function saveCurrentQuery() {
        console.log("[+] Attempting to save query");
        const text = getQueryText();
        console.log("[+] Raw query text:", text);

        if (text.trim()) {
            const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
            console.log("[+] Current saved queries:", savedQueries);
            
            // Check if query already exists
            const queryExists = savedQueries.some(q => q.query === text.trim());
            
            if (!queryExists) {
                // Create query object in the correct format
                const newQuery = {
                    name: `My Query ${savedQueries.length}`,
                    query: text.trim()
                };
                
                savedQueries.push(newQuery);
                localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
                currentQueryIndex = savedQueries.length - 1;
                console.log("[+] Query saved successfully:", newQuery);
            } else {
                console.log("[+] Query already exists in history, not saving duplicate");
            }
        } else {
            console.log("[-] Query text is empty");
        }
    }

    function navigateHistory(direction) {
        if (isNavigating) return;
        isNavigating = true;

        try {
            const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
            if (savedQueries.length === 0) {
                isNavigating = false;
                return;
            }

            // Update current index
            if (currentQueryIndex === -1) {
                currentQueryIndex = direction === -1 ? savedQueries.length - 1 : 0;
            } else {
                currentQueryIndex += direction;
            }

            // Handle bounds
            if (currentQueryIndex >= savedQueries.length) {
                currentQueryIndex = savedQueries.length - 1;
                isNavigating = false;
                return;
            }
            if (currentQueryIndex < 0) {
                currentQueryIndex = 0;
                isNavigating = false;
                return;
            }

            // Try multiple approaches to set text to the query editor
            const queryText = savedQueries[currentQueryIndex].query;
            
            // Approach 0: Use specific XPath provided
            const specificXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[2]/div/div/div[1]/div/div/div/div[2]/div[2]";
            const specificEditor = document.evaluate(specificXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (specificEditor) {
                // Clear existing content and create appropriate structure
                specificEditor.innerHTML = "";
                
                // Split the query into lines and create a line div for each
                const queryLines = queryText.split('\n');
                queryLines.forEach(line => {
                    const lineDiv = document.createElement('div');
                    lineDiv.className = "cm-line";
                    lineDiv.textContent = line;
                    specificEditor.appendChild(lineDiv);
                });
                
                console.log("[+] Set query text to specific XPath editor");
                isNavigating = false;
                return;
            }
            
            // Approach 1: Modern editor with role=textbox (from screenshot)
            const modernEditor = document.querySelector('[role="textbox"]');
            if (modernEditor) {
                modernEditor.textContent = queryText;
                console.log("[+] Set query text to modern editor");
                isNavigating = false;
                return;
            }
            
            // Approach 2: CM Editor
            let queryBox = document.querySelector('.cm-editor.cm-cypher');
            if (queryBox) {
                // Clear existing content
                queryBox.innerHTML = "";
                
                // Split the query into lines and create a line div for each
                const queryLines = queryText.split('\n');
                queryLines.forEach(line => {
                    const lineDiv = document.createElement('div');
                    lineDiv.className = "cm-line";
                    lineDiv.textContent = line;
                    queryBox.appendChild(lineDiv);
                });
                console.log("[+] Set query text to CM editor");
                isNavigating = false;
                return;
            }
            
            // Approach 3: jss52 editor
            const jssEditor = document.querySelector('.jss52');
            if (jssEditor) {
                jssEditor.textContent = queryText;
                console.log("[+] Set query text to jss editor");
                isNavigating = false;
                return;
            }
            
            console.log("[-] Could not find a suitable editor to set the query text");
        } catch (error) {
            console.error("Error navigating history:", error);
        } finally {
            isNavigating = false;
        }
    }

    function checkForCypherQuery() {
        // Try multiple approaches to find the Cypher editor
        
        // Approach 0: Use specific XPath provided
        const specificXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[2]/div/div/div[1]/div/div/div/div[2]/div[2]";
        const specificEditor = document.evaluate(specificXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (specificEditor) {
            console.log("[+] Found Cypher editor using specific XPath");
            addNavigationButtons();
            
            // Only load last query once when page first loads
            if (!hasLoadedInitialQuery) {
                const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
                if (savedQueries.length > 0) {
                    currentQueryIndex = savedQueries.length - 1;
                    const lastQuery = savedQueries[currentQueryIndex];
                    
                    // Clear existing content and create appropriate structure
                    specificEditor.innerHTML = "";
                    
                    // Split the query into lines and create a line div for each
                    const queryLines = lastQuery.query.split('\n');
                    queryLines.forEach(line => {
                        const lineDiv = document.createElement('div');
                        lineDiv.className = "cm-line";
                        lineDiv.textContent = line;
                        specificEditor.appendChild(lineDiv);
                    });
                    
                    // Find the Run button
                    const runButtons = Array.from(document.querySelectorAll('button'));
                    const runButton = runButtons.find(btn => {
                        const btnText = btn.textContent || '';
                        return btnText.includes('Run') && 
                            (btn.querySelector('.fa-play') !== null || 
                             btn.innerHTML.includes('play') ||
                             btn.innerHTML.includes('svg'));
                    });
                    
                    if (runButton) {
                        console.log("[+] Running last query:", lastQuery.query);
                        setTimeout(() => {
                            runButton.click();
                        }, 100);
                    } else {
                        console.log("[-] Run button not found");
                    }
                    
                    hasLoadedInitialQuery = true;  // Set the flag after loading
                }
            }
            return true;
        }
        
        // Approach 1: Modern editor with role=textbox (shown in screenshot)
        const modernEditor = document.querySelector('[role="textbox"]');
        if (modernEditor) {
            console.log("[+] Found modern editor with role=textbox");
            addNavigationButtons();
            
            // Only load last query once when page first loads
            if (!hasLoadedInitialQuery) {
                const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
                if (savedQueries.length > 0) {
                    currentQueryIndex = savedQueries.length - 1;
                    const lastQuery = savedQueries[currentQueryIndex];
                    
                    // Set the text in the editor
                    modernEditor.textContent = lastQuery.query;
                    
                    // Find the Run button
                    const runButtons = Array.from(document.querySelectorAll('button'));
                    const runButton = runButtons.find(btn => {
                        const btnText = btn.textContent || '';
                        return btnText.includes('Run') && 
                            (btn.querySelector('.fa-play') !== null || 
                             btn.innerHTML.includes('play') ||
                             btn.innerHTML.includes('svg'));
                    });
                    
                    if (runButton) {
                        console.log("[+] Running last query:", lastQuery.query);
                        setTimeout(() => {
                            runButton.click();
                        }, 100);
                    } else {
                        console.log("[-] Run button not found");
                    }
                    
                    hasLoadedInitialQuery = true;  // Set the flag after loading
                    return true;
                }
            }
            return true;
        }
        
        // Try to find the CodeMirror editor (older UI)
        let queryBox = document.querySelector('.cm-editor.cm-cypher');
        if (!queryBox) {
            // Try alternative selector
            queryBox = document.querySelector('.jss52');
        }
        
        if (!queryBox) {
            queryBox = document.querySelector('[role="textbox"] .cm-editor');
        }
        
        if (queryBox) {
            const text = queryBox.textContent || "";
            if (text.includes("Cypher Query") || text.trim() === "") {
                console.log("[+] Cypher Query detected or empty editor found");
                addNavigationButtons();
                
                // Only load last query once when page first loads
                if (!hasLoadedInitialQuery && (text.trim() === "Cypher Query" || text.trim() === "")) {
                    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
                    if (savedQueries.length > 0) {
                        currentQueryIndex = savedQueries.length - 1;
                        const lastQuery = savedQueries[currentQueryIndex];
                        
                        // Attempt to populate the query box
                        try {
                        queryBox.textContent = lastQuery.query;
                        
                            // Find the Run button
                            const runButtons = Array.from(document.querySelectorAll('button'));
                            const runButton = runButtons.find(btn => {
                                const btnText = btn.textContent || '';
                                return btnText.includes('Run') && 
                                    (btn.querySelector('.fa-play') !== null || 
                                     btn.innerHTML.includes('play') ||
                                     btn.innerHTML.includes('svg'));
                            });
                            
                        if (runButton) {
                            console.log("[+] Running last query:", lastQuery.query);
                            setTimeout(() => {
                                runButton.click();
                            }, 100);
                            } else {
                                console.log("[-] Run button not found");
                            }
                        } catch (error) {
                            console.error("Error applying last query:", error);
                        }
                        hasLoadedInitialQuery = true;  // Set the flag after loading
                    }
                }
                return true;
            }
        }
        return false;
    }

    function addNeo4jLink() {
        const navUlXPath = "/html/body/div/div/nav/div[1]/ul[1]";
        const navUl = document.evaluate(navUlXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        
        if (navUl) {
            // Add Neo4j link if not already present
            if (!document.querySelector('[data-testid="global_nav-neo4j"]')) {
            const li = document.createElement('li');
            li.className = "h-10 px-2 mx-2 flex items-center rounded text-neutral-dark-0 dark:text-neutral-light-1 hover:text-secondary dark:hover:text-secondary-variant-2";
            
                // Get current host from window.location.origin
                const origin = window.location.origin;
                // Extract hostname (server or IP) without port
                const hostname = window.location.hostname;
                const neo4jUrl = `http://${hostname}:7474`;
                
                // Create link element that matches existing menu items
                const existingLinks = navUl.querySelectorAll('a');
                let templateLink = null;
                if (existingLinks.length > 0) {
                    templateLink = existingLinks[0];
                }
                
                if (templateLink) {
                    // Clone the style from an existing menu item
                    const linkClone = templateLink.cloneNode(true);
                    linkClone.setAttribute('data-testid', 'global_nav-neo4j');
                    linkClone.setAttribute('href', '#');
                    
                    // Find and update the icon
                    const iconSpan = linkClone.querySelector('[data-testid="global_nav-item-label-icon"]');
                    if (iconSpan) {
                        iconSpan.innerHTML = `
                            <svg aria-hidden="true" focusable="false" class="svg-inline--fa" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style="height: 1.2em; width: 1.2em;">
                                <path fill="currentColor" d="m101.4251556 161.342804c0-13.2830658-14.4784546-21.6300507-25.9986649-14.9885254-11.5202179 6.6415405-11.5202141 23.3355255 0 29.9770508s25.9986649-1.7054596 25.9986649-14.9885254zm2.8600846 47.4604492c0-13.2830658-14.4784546-21.6300507-25.9986649-14.9885254-11.5202179 6.6415405-11.5202103 23.3355255 0 29.9770508s25.9986649-1.7054596 25.9986649-14.9885254zm114.385643-157.905735c0-13.2830658-14.4784546-21.6300526-25.9986725-14.9885216s-11.5202026 23.3355141.0000153 29.9770432c11.5202026 6.6415252 25.9986572-1.705452 25.9986572-14.9885216zm45.4341583 15.9617424c0-13.2830696-14.4784546-21.6300583-25.9986725-14.9885254-11.5202026 6.6415367-11.5202026 23.3355103.0000153 29.9770432 11.5202026 6.6415252 25.9986572-1.705452 25.9986572-14.9885178zm-149.2164001 192.2655868c0-13.2830811-14.478447-21.6300659-25.9986649-14.9885254-11.5202179 6.6415253-11.5202103 23.3355103.0000076 29.9770508 11.5202103 6.64151 25.9986573-1.7054749 25.9986573-14.9885254zm23.7595977 45.0974732c0-13.2830505-14.4784546-21.6300354-25.9986725-14.9884949-11.5202179 6.64151-11.5202103 23.3355103.0000076 29.9770203 11.5202103 6.6415405 25.9986649-1.7054444 25.9986649-14.9885254zm185.2721405 63.0645446c0-13.2830505-14.4784241-21.6300354-25.9986572-14.9884949-11.5202026 6.64151-11.5202026 23.3355103 0 29.9770203 11.5202332 6.6415406 25.9986572-1.7054443 25.9986572-14.9885254zm31.4452515-37.2209777c0-13.2830505-14.4784546-21.6300354-25.9986877-14.9884949-11.5202026 6.64151-11.5202026 23.3355103 0 29.9770203 11.5202331 6.6415405 25.9986877-1.7054444 25.9986877-14.9885254zm-81.4590149 117.5672607c91.8938599-22.7735901 167.0243225-103.3045044 169.7027893-209.4750519 37.6954041-66.5650177.7892151-153.0506592-74.4309387-171.2645874-56.9179993-50.1389942-138.4701386-70.9333892-215.7419891-45.7142906-19.422638-21.0242051-52.1943512-28.6514583-80.2715454-12.4645891-31.5057068 18.1633615-39.9645005 56.4311151-25.3861733 85.3972025-74.9092293 93.9835662-61.7278118 238.4411773 39.4973946 314.6851043-5.3036805 113.2078247 147.8216095 143.6231079 186.6304626 38.8362122zm-112.7381592-416.2070999c65.1693268-19.819849 133.1513672-5.388176 184.6532288 32.1827202-83.7071838-3.6204338-145.7319641 81.8144645-112.9093475 161.5573845 33.4402618 81.2436066 141.0527802 97.5952911 197.2452545 32.1033478-10.2729492 88.3050842-74.3753662 154.9010315-152.6705933 176.9292908 18.4413757-124.0523071-155.6600037-161.8092041-188.1890259-39.1574707-89.6915665-72.1559448-101.223671-202.8563232-34.5949516-290.074585 53.4895363 62.5425109 145.7842369-4.5809098 106.465435-73.5406876z"></path>
                            </svg>`;
                    }
                    
                    // Find and update the text 
                    const textSpan = linkClone.querySelector('[data-testid="global_nav-item-label-text"]');
                    if (textSpan) {
                        textSpan.textContent = "Neo4j";
                    }
                    
                    // Clear other attributes that might be copied
                    linkClone.removeAttribute('href');
                    linkClone.href = "#";
                    
                    // Add the link to the li element
                    li.innerHTML = '';
                    li.appendChild(linkClone);
                    
                    // Add the li to the nav
                    navUl.appendChild(li);
                    
                    // Add click handler to open Neo4j browser
                    linkClone.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.open(neo4jUrl, '_blank');
                    });
                } else {
                    // Fallback to basic styling if no template found
            li.innerHTML = `
                        <a href="#" data-testid="global_nav-neo4j" class="flex items-center w-full h-10 gap-2 font-medium">
                    <span data-testid="global_nav-item-label-icon" class="flex">
                                <svg aria-hidden="true" focusable="false" class="svg-inline--fa" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style="height: 1.2em; width: 1.2em;">
                            <path fill="currentColor" d="m101.4251556 161.342804c0-13.2830658-14.4784546-21.6300507-25.9986649-14.9885254-11.5202179 6.6415405-11.5202141 23.3355255 0 29.9770508s25.9986649-1.7054596 25.9986649-14.9885254zm2.8600846 47.4604492c0-13.2830658-14.4784546-21.6300507-25.9986649-14.9885254-11.5202179 6.6415405-11.5202103 23.3355255 0 29.9770508s25.9986649-1.7054596 25.9986649-14.9885254zm114.385643-157.905735c0-13.2830658-14.4784546-21.6300526-25.9986725-14.9885216s-11.5202026 23.3355141.0000153 29.9770432c11.5202026 6.6415252 25.9986572-1.705452 25.9986572-14.9885216zm45.4341583 15.9617424c0-13.2830696-14.4784546-21.6300583-25.9986725-14.9885254-11.5202026 6.6415367-11.5202026 23.3355103.0000153 29.9770432 11.5202026 6.6415252 25.9986572-1.705452 25.9986572-14.9885178zm-149.2164001 192.2655868c0-13.2830811-14.478447-21.6300659-25.9986649-14.9885254-11.5202179 6.6415253-11.5202103 23.3355103.0000076 29.9770508 11.5202103 6.64151 25.9986573-1.7054749 25.9986573-14.9885254zm23.7595977 45.0974732c0-13.2830505-14.4784546-21.6300354-25.9986725-14.9884949-11.5202179 6.64151-11.5202103 23.3355103.0000076 29.9770203 11.5202103 6.6415405 25.9986649-1.7054444 25.9986649-14.9885254zm185.2721405 63.0645446c0-13.2830505-14.4784241-21.6300354-25.9986572-14.9884949-11.5202026 6.64151-11.5202026 23.3355103 0 29.9770203 11.5202332 6.6415406 25.9986572-1.7054443 25.9986572-14.9885254zm31.4452515-37.2209777c0-13.2830505-14.4784546-21.6300354-25.9986877-14.9884949-11.5202026 6.64151-11.5202026 23.3355103 0 29.9770203 11.5202331 6.6415405 25.9986877-1.7054444 25.9986877-14.9885254zm-81.4590149 117.5672607c91.8938599-22.7735901 167.0243225-103.3045044 169.7027893-209.4750519 37.6954041-66.5650177.7892151-153.0506592-74.4309387-171.2645874-56.9179993-50.1389942-138.4701386-70.9333892-215.7419891-45.7142906-19.422638-21.0242051-52.1943512-28.6514583-80.2715454-12.4645891-31.5057068 18.1633615-39.9645005 56.4311151-25.3861733 85.3972025-74.9092293 93.9835662-61.7278118 238.4411773 39.4973946 314.6851043-5.3036805 113.2078247 147.8216095 143.6231079 186.6304626 38.8362122zm-112.7381592-416.2070999c65.1693268-19.819849 133.1513672-5.388176 184.6532288 32.1827202-83.7071838-3.6204338-145.7319641 81.8144645-112.9093475 161.5573845 33.4402618 81.2436066 141.0527802 97.5952911 197.2452545 32.1033478-10.2729492 88.3050842-74.3753662 154.9010315-152.6705933 176.9292908 18.4413757-124.0523071-155.6600037-161.8092041-188.1890259-39.1574707-89.6915665-72.1559448-101.223671-202.8563232-34.5949516-290.074585 53.4895363 62.5425109 145.7842369-4.5809098 106.465435-73.5406876z"></path>
                        </svg>
                    </span>
                            <span data-testid="global_nav-item-label-text" class="text-xl">Neo4j</span>
                        </a>
                    `;
                    
            navUl.appendChild(li);

            // Add click handler to open Neo4j browser
            const link = li.querySelector('a');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(neo4jUrl, '_blank');
            });
                }
                
                hasAddedNeo4jLink = true;
                console.log("[+] Added Neo4j link to navigation");
            }
            
            // Donate link removed from navigation menu as requested
        }
    }

    function removeUnwantedElement() {
        // Look for links in the cypher query area
        const cyperContainer = document.querySelector('[role="tabpanel"]');
        if (cyperContainer) {
            const links = cyperContainer.querySelectorAll('a');
            links.forEach(link => {
                if (!link.getAttribute('data-testid') && !link.hasAttribute('data-preserved')) {
                    link.remove();
                }
            });
        }
    }

    function adjustContainerWidth() {
        // Width adjustments were causing issues and are no longer needed
        // This function is kept for compatibility but doesn't modify width
        
        // Add a style tag to override any problematic media queries
            const styleId = 'override-flex-basis';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                /* Media query overrides disabled */
                `;
                document.head.appendChild(style);
        }
    }

    // Run code when document is ready
    if (document.title === "BloodHound") {
        // Add Neo4j link to all BloodHound pages, not just /ui/explore
        addNeo4jLink();
        
        // Only apply the other changes specific to the explore page
    if (window.location.href.includes('ui/explore')) {
        // Initial check for run button and container width
        checkForRunButton();
            // Width adjustment disabled due to UI issues
            // adjustContainerWidth();
        
        // Reduced interval to 100ms
        const intervalId = setInterval(async () => {
            applyAllChanges();
        }, 100);
        
        // Add a mutation observer to watch for DOM changes with optimized callback
        const observer = new MutationObserver((mutations) => {
            // Only apply changes if mutations affect relevant elements
            const relevantMutation = mutations.some(mutation => {
                return mutation.target.className?.includes('MuiBox-root') ||
                       mutation.target.className?.includes('cm-line');
            });
            if (relevantMutation) {
                applyAllChanges();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        // Cleanup when navigating away
        window.addEventListener('beforeunload', () => {
            clearInterval(intervalId);
            clearInterval(cypherTabCheckInterval);
            observer.disconnect();
            urlObserver.disconnect();
            });
        }
        
        // Watch for navigation bar appearing after page loads
        const navObserver = new MutationObserver(() => {
            if (!hasAddedNeo4jLink) {
                addNeo4jLink();
                
                // If we've successfully added the link, no need to keep observing
                if (hasAddedNeo4jLink) {
                    navObserver.disconnect();
                }
            }
        });
        
        navObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}