if (document.title === "BloodHound") {
    let currentQueryIndex = -1;
    let hasLoadedInitialQuery = false;
    let isNavigating = false;
    let lastUrl = window.location.href;
    let hasAddedCypherListener = false;

    // Function to apply all UI changes at once
    function applyAllChanges() {
        checkForCypherQuery();
        checkForRunButton();
        addNavigationButtons();
        addNeo4jLink();
        removeUnwantedElement();
        adjustContainerWidth();
    }

    // Function to handle Cypher tab click
    function handleCypherTabClick() {
        const cypherTabXPath = "/html/body/div[1]/div[1]/div/div/div/div/div[2]/div[1]/div[1]/div[1]/div/div/div/button[3]";
        const cypherTab = document.evaluate(cypherTabXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        
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
        const runButtonXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[2]/button[2]";
        const runButton = document.evaluate(runButtonXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        // Check if buttons already exist
        if (runButton && !document.querySelector('[data-nav-buttons="true"]')) {
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '5px';
            buttonContainer.style.alignItems = 'center';
            buttonContainer.style.width = '100%';
            buttonContainer.style.flexWrap = 'nowrap';
            buttonContainer.style.justifyContent = 'flex-end';
            buttonContainer.style.marginBottom = '5px';
            buttonContainer.style.overflow = 'visible';

            // Move Save Query button
            const saveQueryButtonXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[2]/button[1]";
            const saveQueryButton = document.evaluate(saveQueryButtonXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            
            if (saveQueryButton) {
                saveQueryButton.style.order = '-1';
                buttonContainer.appendChild(saveQueryButton);
            }
			
            const backButton = document.createElement('button');
            backButton.className = "inline-flex items-center justify-center whitespace-nowrap rounded-3xl ring-offset-background transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:no-underline bg-primary text-white shadow-outer-1 hover:bg-secondary h-9 px-4 py-1 text-xs";
            backButton.innerHTML = '<div class="MuiBox-root css-70qvj9"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="backward" class="svg-inline--fa fa-backward" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3V256v41.7L459.5 440.6zM256 352V256 128 96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V352z"/></svg></div>';
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
        // Fixed XPath for the Run button
        const runButtonXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[2]/button";
        const runButton = document.evaluate(runButtonXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        
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
        const editorXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[1]/div/div/div/div[2]/div[2]";
        const editor = document.evaluate(editorXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        
        if (!editor) return "";

        // Get all lines and their content
        const lines = [];
        let currentLine = "";
        let inMatch = false;
        let inReturn = false;
        let inLimit = false;

        editor.querySelectorAll('.cm-line').forEach(line => {
            const tokens = Array.from(line.childNodes).map(node => {
                if (node.nodeType === Node.TEXT_NODE) return node.textContent;
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const text = node.textContent;
                    if (text.toUpperCase() === 'MATCH') inMatch = true;
                    if (text.toUpperCase() === 'RETURN') inReturn = true;
                    if (text.toUpperCase() === 'LIMIT') inLimit = true;
                    return text;
                }
                return '';
            });

            currentLine = tokens.join('').trim();
            if (currentLine) lines.push(currentLine);
        });

        // Format the query properly
        let query = lines.join(' ');
        
        // Add proper spacing around keywords and operators
        query = query.replace(/MATCH/gi, 'MATCH ')
                    .replace(/WHERE/gi, ' WHERE ')
                    .replace(/RETURN/gi, ' RETURN ')
                    .replace(/LIMIT/gi, ' LIMIT ')
                    .replace(/\s+/g, ' ')
                    .replace(/\(\s+/g, '(')
                    .replace(/\s+\)/g, ')')
                    .replace(/\[\s+/g, '[')
                    .replace(/\s+\]/g, ']')
                    .trim();

        return query;
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

            // Update query box with historical query
            const queryBoxXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[1]/div/div/div/div[2]/div[2]/div";
            const queryBox = document.evaluate(queryBoxXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            
            if (queryBox) {
                // Clear existing content
                queryBox.innerHTML = "";
                
                // Split the query into lines and create a line div for each
                const queryLines = savedQueries[currentQueryIndex].query.split('\n');
                queryLines.forEach(line => {
                    const lineDiv = document.createElement('div');
                    lineDiv.className = "cm-line";
                    lineDiv.textContent = line;
                    queryBox.appendChild(lineDiv);
                });
            }
        } finally {
            isNavigating = false;
        }
    }

    function checkForCypherQuery() {
        const queryBoxXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[1]/div/div/div/div[2]/div[2]";
        const queryBox = document.evaluate(queryBoxXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (queryBox) {
            const text = queryBox.textContent || "";
            if (text.includes("Cypher Query")) {
                console.log("[+] Cypher Query detected");
                addNavigationButtons();
                
                // Only load last query once when page first loads
                if (!hasLoadedInitialQuery && text.trim() === "Cypher Query") {
                    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
                    if (savedQueries.length > 0) {
                        currentQueryIndex = savedQueries.length - 1;
                        const lastQuery = savedQueries[currentQueryIndex];
                        
                        queryBox.textContent = lastQuery.query;
                        
                        const runButtonXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[2]/button[2]";
                        const runButton = document.evaluate(runButtonXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (runButton) {
                            console.log("[+] Running last query:", lastQuery.query);
                            setTimeout(() => {
                                runButton.click();
                            }, 100);
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
        
        if (navUl && !document.querySelector('[data-testid="global_nav-neo4j"]')) {
            const li = document.createElement('li');
            li.className = "h-10 px-2 mx-2 flex items-center rounded text-neutral-dark-0 dark:text-neutral-light-1 hover:text-secondary dark:hover:text-secondary-variant-2";
            
            // Get current LM Studio location from input
            const locationInput = document.querySelector('input[data-nav-buttons="true"]');
            const currentIP = locationInput ? locationInput.value : 'localhost';
            const neo4jUrl = `http://${currentIP}:7474`;
            
            li.innerHTML = `
                <a href="#" data-testid="global_nav-neo4j" class="h-10 w-auto absolute left-12 flex items-center gap-x-2 hover:underline group-hover:w-full cursor-pointer">
                    <span data-testid="global_nav-item-label-icon" class="flex">
                        <svg aria-hidden="true" focusable="false" class="svg-inline--fa" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                            <path fill="currentColor" d="m101.4251556 161.342804c0-13.2830658-14.4784546-21.6300507-25.9986649-14.9885254-11.5202179 6.6415405-11.5202141 23.3355255 0 29.9770508s25.9986649-1.7054596 25.9986649-14.9885254zm2.8600846 47.4604492c0-13.2830658-14.4784546-21.6300507-25.9986649-14.9885254-11.5202179 6.6415405-11.5202103 23.3355255 0 29.9770508s25.9986649-1.7054596 25.9986649-14.9885254zm114.385643-157.905735c0-13.2830658-14.4784546-21.6300526-25.9986725-14.9885216s-11.5202026 23.3355141.0000153 29.9770432c11.5202026 6.6415252 25.9986572-1.705452 25.9986572-14.9885216zm45.4341583 15.9617424c0-13.2830696-14.4784546-21.6300583-25.9986725-14.9885254-11.5202026 6.6415367-11.5202026 23.3355103.0000153 29.9770432 11.5202026 6.6415252 25.9986572-1.705452 25.9986572-14.9885178zm-149.2164001 192.2655868c0-13.2830811-14.478447-21.6300659-25.9986649-14.9885254-11.5202179 6.6415253-11.5202103 23.3355103.0000076 29.9770508 11.5202103 6.64151 25.9986573-1.7054749 25.9986573-14.9885254zm23.7595977 45.0974732c0-13.2830505-14.4784546-21.6300354-25.9986725-14.9884949-11.5202179 6.64151-11.5202103 23.3355103.0000076 29.9770203 11.5202103 6.6415405 25.9986649-1.7054444 25.9986649-14.9885254zm185.2721405 63.0645446c0-13.2830505-14.4784241-21.6300354-25.9986572-14.9884949-11.5202026 6.64151-11.5202026 23.3355103 0 29.9770203 11.5202332 6.6415406 25.9986572-1.7054443 25.9986572-14.9885254zm31.4452515-37.2209777c0-13.2830505-14.4784546-21.6300354-25.9986877-14.9884949-11.5202026 6.64151-11.5202026 23.3355103 0 29.9770203 11.5202331 6.6415405 25.9986877-1.7054444 25.9986877-14.9885254zm-81.4590149 117.5672607c91.8938599-22.7735901 167.0243225-103.3045044 169.7027893-209.4750519 37.6954041-66.5650177.7892151-153.0506592-74.4309387-171.2645874-56.9179993-50.1389942-138.4701386-70.9333892-215.7419891-45.7142906-19.422638-21.0242051-52.1943512-28.6514583-80.2715454-12.4645891-31.5057068 18.1633615-39.9645005 56.4311151-25.3861733 85.3972025-74.9092293 93.9835662-61.7278118 238.4411773 39.4973946 314.6851043-5.3036805 113.2078247 147.8216095 143.6231079 186.6304626 38.8362122zm-112.7381592-416.2070999c65.1693268-19.819849 133.1513672-5.388176 184.6532288 32.1827202-83.7071838-3.6204338-145.7319641 81.8144645-112.9093475 161.5573845 33.4402618 81.2436066 141.0527802 97.5952911 197.2452545 32.1033478-10.2729492 88.3050842-74.3753662 154.9010315-152.6705933 176.9292908 18.4413757-124.0523071-155.6600037-161.8092041-188.1890259-39.1574707-89.6915665-72.1559448-101.223671-202.8563232-34.5949516-290.074585 53.4895363 62.5425109 145.7842369-4.5809098 106.465435-73.5406876z"></path>
                        </svg>
                    </span>
                    <span data-testid="global_nav-item-label-text" class="whitespace-nowrap min-h-10 font-medium text-xl opacity-0 hidden transition-opacity duration-200 ease-in group-hover:w-full group-hover:opacity-100 group-hover:flex group-hover:items-center group-hover:gap-x-5">Neo4j</span>
                </a>`;
            navUl.appendChild(li);

            // Add click handler to open Neo4j browser
            const link = li.querySelector('a');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(neo4jUrl, '_blank');
            });
        }
    }

    function removeUnwantedElement() {
        const elementXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[2]/a";
        const element = document.evaluate(elementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (element) {
            element.remove();
        }
    }

    function adjustContainerWidth() {
        const containerXPath = "/html/body/div[1]/div/div/div/div/div/div[2]/div[1]";
        const container = document.evaluate(containerXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (container) {
            //console.log("[+] Found container, current width:", container.style.width);
            container.style.width = '38%';
            container.style.maxWidth = '38%';
            container.style.flexBasis = 'unset !important';
            container.style.boxSizing = 'border-box';
            container.style.webkitBoxFlex = '0';
            container.style.webkitFlexBasis = 'unset !important';
            container.style.msFlexPreferredSize = 'unset !important';
            
            // Override the flex-basis for the parent container
            const parentElement = container.closest('.css-11n9kbb');
            if (parentElement) {
                parentElement.style.flexBasis = 'unset !important';
                parentElement.style.webkitFlexBasis = 'unset !important';
                parentElement.style.msFlexPreferredSize = 'unset !important';
                parentElement.style.width = '38%';
            }
            
            // Add a style tag to override the media query
            const styleId = 'override-flex-basis';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                    @media (min-width: 1536px) {
                        .css-linkbkb {
                            flex-basis: unset !important;
                            -webkit-flex-basis: unset !important;
                            -ms-flex-preferred-size: unset !important;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            //console.log("[+] Updated container width to:", container.style.width);
        } else {
            console.log("[-] Container not found");
        }
    }

    async function refreshServerCache() {
        try {
            // Get Flask server address from input
            const serverInput = document.querySelector('[data-server-address="true"]');
            const serverAddress = serverInput ? serverInput.value : 'localhost:5000';
            
            console.log("[+] Refreshing server cache:", serverAddress);
            const response = await fetch(`http://${serverAddress}/refresh`, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log("[+] Response received:", response);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("[+] Cache refreshed:", data);
            
            // Show success message
            alert(`Cache refreshed successfully!\n\nNodes: ${data.data.regular_nodes}\nRelationships: ${data.data.regular_relationships}\nAzure Nodes: ${data.data.azure_nodes}\nAzure Relationships: ${data.data.azure_relationships}`);
            
        } catch (error) {
            console.error('Error:', error);
            alert(`Error refreshing cache: ${error.message}. Please try again.`);
        }
    }

    if (window.location.href.includes('ui/explore')) {
        // Initial check for run button and container width
        checkForRunButton();
        adjustContainerWidth();
        
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
}