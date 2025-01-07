if (document.title === "BloodHound") {
    let buttonsFixed = false;

    // Function to check URL and run fixButtons
    function checkUrlAndFixButtons() {
        if (window.location.href.includes('ui/explore') && !buttonsFixed) {
            fixButtons();
        }
    }

    // Run the check every 100ms until buttons are fixed
    const checkInterval = setInterval(() => {
        if (buttonsFixed) {
            clearInterval(checkInterval); // Stop checking once fixed
            return;
        }
        checkUrlAndFixButtons();
    }, 100);

    // Listen for URL changes
    let lastUrl = window.location.href;
    new MutationObserver(() => {
        const url = window.location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            buttonsFixed = false; // Reset the flag when URL changes
            checkUrlAndFixButtons(); // Check if we need to fix buttons on new page
        }
    }).observe(document, {subtree: true, childList: true});

    function fixButtons(){
        if (buttonsFixed) return;

        // Get the Layout button
        const layoutXpath = "/html/body/div[1]/div/div[2]/div/div/div[2]/div[1]/div[2]/div/button[3]";
        const layoutButton = document.evaluate(layoutXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        // Check if our custom menu already exists
        const existingMenu = document.querySelector('[data-custom-menu="true"]');
        if (existingMenu) {
            buttonsFixed = true;
            return;
        }

        if (layoutButton) {
            // Create our new menu container
            const menuContainer = document.createElement('div');
            menuContainer.style.display = 'inline-flex';
            menuContainer.style.alignItems = 'center';
            menuContainer.style.backgroundColor = '#1e1e1e';
            menuContainer.style.borderRadius = '4px';
            menuContainer.style.padding = '4px';
            menuContainer.style.gap = '4px';
            
            // Add style to hide only the Layout button's popover menu
            const style = document.createElement('style');
            style.textContent = `
                [role="presentation"] .MuiPopover-root[data-popper-placement="bottom-start"] {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
            
            // Create Standard option with React props
            const standard = document.createElement('div');
            standard.textContent = 'Standard';
            standard.style.padding = '6px 12px';
            standard.style.cursor = 'pointer';
            standard.style.color = 'white';
            standard.style.borderRadius = '4px';
            standard.addEventListener('mouseover', () => standard.style.backgroundColor = '#333');
            standard.addEventListener('mouseout', () => standard.style.backgroundColor = 'transparent');

            // Create Sequential option with React props
            const sequential = document.createElement('div');
            sequential.textContent = 'Sequential';
            sequential.style.padding = '6px 12px';
            sequential.style.cursor = 'pointer';
            sequential.style.color = 'white';
            sequential.style.borderRadius = '4px';
            sequential.addEventListener('mouseover', () => sequential.style.backgroundColor = '#333');
            sequential.addEventListener('mouseout', () => sequential.style.backgroundColor = 'transparent');
            
            
            standard.addEventListener('click', () => {
                layoutButton.click();
                setTimeout(() => {
                    const standardXpath = "/html/body/div[1]/div/div[4]/div[3]/ul/div[2]/li";
                    const originalStandard = document.evaluate(standardXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if (originalStandard) originalStandard.click();
                    document.body.click();
                }, 50);
            });
            
            // Add click handlers
            sequential.addEventListener('click', () => {
                layoutButton.click();
                setTimeout(() => {
                    const sequentialXpath = "/html/body/div[1]/div/div[4]/div[3]/ul/div[1]/li";
                    const originalSequential = document.evaluate(sequentialXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if (originalSequential) originalSequential.click();
                    document.body.click();
                }, 50);
            });
            
            
            // Add items to container
            menuContainer.appendChild(standard);
            menuContainer.appendChild(sequential);
            
            
            // Replace Layout button with our menu
            layoutButton.style.display = 'none';
            layoutButton.parentNode.insertBefore(menuContainer, layoutButton);
        
            buttonsFixed = true;
            clearInterval(checkInterval); // Stop checking once fixed
        }

    }

    // Function to update CSS root variables with new colors
    function updateRootColors() {
        const root = document.documentElement;

        // Define new colors
        const primary = '#009fd6';
        const primaryVariant = '#0086b3';
        const secondary = '#0078a3';
        const secondaryVariant = '#005f82';
        const secondaryVariant2 = '#004d66';
        

        // Set the new colors in the root CSS
        root.style.setProperty('--primary', primary);
        root.style.setProperty('--primary-variant', primaryVariant);
        root.style.setProperty('--secondary', secondary);
        root.style.setProperty('--secondary-variant', secondaryVariant);
        root.style.setProperty('--secondary-variant-2', secondaryVariant2);

            // Create a new style element
        var style = document.createElement('style');
        style.type = 'text/css';

        // Add the CSS rule with !important
        style.innerHTML = 'a { color: ' + primary + ' !important; } ';

        // Append the style element to the head of the document
        document.head.appendChild(style);

    }

    // Call the function to apply the new colors
    updateRootColors();

    // Function to check and update the image source
    function updateImageSource() {
        const persistedState = localStorage.getItem("persistedState");
        if (persistedState) {
            // Parse the JSON string into an object
            const state = JSON.parse(persistedState);

            // Check if the global view and darkMode properties exist
            if (state.global && state.global.view && typeof state.global.view.darkMode === "boolean") {
                if (state.global.view.darkMode) {
                    log_newUrl = chrome.runtime.getURL("dark-logo.png");
                } else {
                    log_newUrl = chrome.runtime.getURL("white-logo.png");
                }
            }
            const im_xpath = "/html/body/div[1]/div/div[1]/header/div/div[1]/a/img";
        
            // Use XPath to find the element
            const imgElement = document.evaluate(
                im_xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;

            // Check if the element exists and update its src
            if (imgElement && imgElement.tagName === 'IMG') {
                if (imgElement.src !== log_newUrl) {
                    imgElement.src = log_newUrl;
                }
            }  
        }
    }

    function isXPathPresent(xpath) {
        const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        );
        return result.singleNodeValue !== null;
    }

    function addNeo4jMenuItem() {
        // First check if Neo4j menu item already exists
        const existingNeo4j = document.querySelector('[new="neo4j"]');
        if (existingNeo4j) {
            return;
        }

        const targetXPath = "/html/body/div/div/div[1]/header/div/div[2]/div[2]";
        const targetElement = document.evaluate(
            targetXPath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (targetElement) {
            const neo4jDiv = document.createElement('div');
            neo4jDiv.className = 'jss14';
            neo4jDiv.setAttribute('data-testid', 'global_header_nav-group-management');
            neo4jDiv.setAttribute('new', 'neo4j');
            
            neo4jDiv.innerHTML = `
                    <div class="jss15 MuiBox-root css-0" style="inline" new="neo4j">
                        <svg aria-hidden="true" focusable="false"
                            class="svg-inline--fa" role="img" 
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                            <path fill="currentColor" d="m101.4251556 161.342804c0-13.2830658-14.4784546-21.6300507-25.9986649-14.9885254-11.5202179 6.6415405-11.5202141 23.3355255 0 29.9770508s25.9986649-1.7054596 25.9986649-14.9885254zm2.8600846 47.4604492c0-13.2830658-14.4784546-21.6300507-25.9986649-14.9885254-11.5202179 6.6415405-11.5202103 23.3355255 0 29.9770508s25.9986649-1.7054596 25.9986649-14.9885254zm114.385643-157.905735c0-13.2830658-14.4784546-21.6300526-25.9986725-14.9885216s-11.5202026 23.3355141.0000153 29.9770432c11.5202026 6.6415252 25.9986572-1.705452 25.9986572-14.9885216zm45.4341583 15.9617424c0-13.2830696-14.4784546-21.6300583-25.9986725-14.9885254-11.5202026 6.6415367-11.5202026 23.3355103.0000153 29.9770432 11.5202026 6.6415252 25.9986572-1.705452 25.9986572-14.9885178zm-149.2164001 192.2655868c0-13.2830811-14.478447-21.6300659-25.9986649-14.9885254-11.5202179 6.6415253-11.5202103 23.3355103.0000076 29.9770508 11.5202103 6.64151 25.9986573-1.7054749 25.9986573-14.9885254zm23.7595977 45.0974732c0-13.2830505-14.4784546-21.6300354-25.9986725-14.9884949-11.5202179 6.64151-11.5202103 23.3355103.0000076 29.9770203 11.5202103 6.6415405 25.9986649-1.7054444 25.9986649-14.9885254zm185.2721405 63.0645446c0-13.2830505-14.4784241-21.6300354-25.9986572-14.9884949-11.5202026 6.64151-11.5202026 23.3355103 0 29.9770203 11.5202332 6.6415406 25.9986572-1.7054443 25.9986572-14.9885254zm31.4452515-37.2209777c0-13.2830505-14.4784546-21.6300354-25.9986877-14.9884949-11.5202026 6.64151-11.5202026 23.3355103 0 29.9770203 11.5202331 6.6415405 25.9986877-1.7054444 25.9986877-14.9885254zm-81.4590149 117.5672607c91.8938599-22.7735901 167.0243225-103.3045044 169.7027893-209.4750519 37.6954041-66.5650177.7892151-153.0506592-74.4309387-171.2645874-56.9179993-50.1389942-138.4701386-70.9333892-215.7419891-45.7142906-19.422638-21.0242051-52.1943512-28.6514583-80.2715454-12.4645891-31.5057068 18.1633615-39.9645005 56.4311151-25.3861733 85.3972025-74.9092293 93.9835662-61.7278118 238.4411773 39.4973946 314.6851043-5.3036805 113.2078247 147.8216095 143.6231079 186.6304626 38.8362122zm-112.7381592-416.2070999c65.1693268-19.819849 133.1513672-5.388176 184.6532288 32.1827202-83.7071838-3.6204338-145.7319641 81.8144645-112.9093475 161.5573845 33.4402618 81.2436066 141.0527802 97.5952911 197.2452545 32.1033478-10.2729492 88.3050842-74.3753662 154.9010315-152.6705933 176.9292908 18.4413757-124.0523071-155.6600037-161.8092041-188.1890259-39.1574707-89.6915665-72.1559448-101.223671-202.8563232-34.5949516-290.074585 53.4895363 62.5425109 145.7842369-4.5809098 106.465435-73.5406876z" />
                        </svg>
                        Neo4j
                    </div>
                    
            `;

            targetElement.insertAdjacentElement('afterend', neo4jDiv);
            
            neo4jDiv.addEventListener('click', () => {
                // Get the current domain
                const currentDomain = window.location.hostname;
                window.open(`http://${currentDomain}:7474`, '_blank');
            });
        }
    }

    function MDRun() {
        let currentQueryIndex = -1; // Track the current query index for Back and Forward navigation

        function createNavigationButtons() {
            // Get the container where the navigation buttons will be added
            var container = getElementByXPath("/html/body/div[1]/div/div[2]/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[2]");
            
            if (container) {
                // Create the Back button
                var backButton = document.createElement("button");
                backButton.innerText = "Back";
                backButton.className = "inline-flex items-center justify-center whitespace-nowrap rounded-3xl ring-offset-background transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:no-underline bg-neutral-light-5 text-neutral-dark-0 shadow-outer-1 hover:bg-secondary hover:text-white h-9 px-4 py-1";
                backButton.addEventListener("click", function () {
                    navigateQueries(-1); // Navigate backward
                });

                // Create the Forward button
                var forwardButton = document.createElement("button");
                forwardButton.innerText = "Forward";
                forwardButton.className = "inline-flex items-center justify-center whitespace-nowrap rounded-3xl ring-offset-background transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:no-underline bg-neutral-light-5 text-neutral-dark-0 shadow-outer-1 hover:bg-secondary hover:text-white h-9 px-4 py-1";
                forwardButton.addEventListener("click", function () {
                    navigateQueries(1); // Navigate forward
                });

                // Append the buttons to the container
                container.appendChild(backButton);
                container.appendChild(forwardButton);
            }
        }

        function navigateQueries(direction) {
            var savedQueriesKey = "savedQueries";
            var savedQueries = JSON.parse(localStorage.getItem(savedQueriesKey)) || [];

            if (savedQueries.length === 0) {
                return;
            }

            // If it's the first navigation
            if (currentQueryIndex === -1) {
                if (direction === -1 && savedQueries.length > 1) {
                    // For back button, start from one before last if it exists
                    currentQueryIndex = savedQueries.length - 2;
                } else if (direction === -1) {
                    // If only one query exists, stay at the last one
                    currentQueryIndex = savedQueries.length - 1;
                } else {
                    // For forward button, start from first
                    currentQueryIndex = 0;
                }
            } else {
                // Update the current index based on the navigation direction
                currentQueryIndex += direction;
            }

            // Handle boundaries
            if (currentQueryIndex < 0) {
                currentQueryIndex = 0;
                return;
            }
            if (currentQueryIndex >= savedQueries.length) {
                currentQueryIndex = savedQueries.length - 1;
                return;
            }

            // Get the target element to display the query
            var targetElement = document.querySelector(".cm-content.cm-lineWrapping");
            if (targetElement) {
                targetElement.innerHTML = ""; // Clear existing content
                const lineDiv = document.createElement('div');
                lineDiv.className = "cm-line";
                lineDiv.textContent = savedQueries[currentQueryIndex].query;
                targetElement.appendChild(lineDiv);
            }
        }

        function saveQuery() {
            // Get the element by XPath
            var element = getElementByXPath("/html/body/div[1]/div/div[2]/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[1]/div/div/div/div[2]/div[2]");
            
            if (element) {
                let textContent = "";
                element.querySelectorAll(".cm-line").forEach(line => {
                    textContent += line.innerText + "\n";
                });

                textContent = textContent.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

                var savedQueriesKey = "savedQueries";
                var savedQueries = JSON.parse(localStorage.getItem(savedQueriesKey)) || [];

                var isDuplicate = savedQueries.some(query => query.query === textContent);

                if (!isDuplicate && textContent) {
                    var queryName = `My Query ${savedQueries.length}`;
                    savedQueries.push({ name: queryName, query: textContent });
                    localStorage.setItem(savedQueriesKey, JSON.stringify(savedQueries));
                    currentQueryIndex = savedQueries.length - 1;
                }
            }
        }

        // Function to get an element by XPath
        function getElementByXPath(xpath) {
            var result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue;
        }

        // Execute the functions
        createNavigationButtons();
        // Add event listener to save button
        var saveButton = getElementByXPath("/html/body/div[1]/div/div[2]/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[2]/button[2]");
        if (saveButton) {
            saveButton.addEventListener("click", saveQuery);
        }
    }

    // Function to check for Cypher Query text
    let cypherQueryDetected = false; // Flag to track if we've already detected and handled the Cypher Query

    function checkForCypherQuery() {
        
        if (cypherQueryDetected) return; // Skip if we've already handled it
        
        const queryBoxXPath = "/html/body/div[1]/div/div[2]/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[1]/div/div/div/div[2]/div[2]";
        const queryBox = document.evaluate(
            queryBoxXPath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (queryBox) {
            const text = queryBox.textContent || "";
            if (text.includes("Cypher Query")) {
                const savedQueries = JSON.parse(localStorage.getItem("savedQueries")) || [];
                if (savedQueries.length > 0) {
                    const lastQuery = savedQueries[savedQueries.length - 1].query;
                    // Clear existing content
                    queryBox.innerHTML = "";
                    // Create a new div for the line
                    const lineDiv = document.createElement('div');
                    lineDiv.className = "cm-line";
                    lineDiv.textContent = lastQuery;
                    // Add the line to the query box
                    queryBox.appendChild(lineDiv);
                    cypherQueryDetected = true; // Set the flag to true after handling
                }
            }
        }
    }

    // Your code to execute when the XPath is not found
    function handleXPathNotFound() {
        //console.log("XPath not found. Waiting...");
        // Add your custom code here
    }

    // XPath to monitor
    const xpathToCheck = "/html/body/div[1]/div/div[2]/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[2]/button[2]";
    let wasXPathPresent = false; // Track the previous state of the XPath

    // Check every second
    const intervalId = setInterval(() => {
        updateImageSource();
        checkForCypherQuery(); // Add the new check
        const isPresent = isXPathPresent(xpathToCheck);
        if (isPresent && !wasXPathPresent) {
            //console.log("XPath appeared!");
            const help_xpath = "/html/body/div[1]/div/div[2]/div/div/div[2]/div[1]/div[1]/div[2]/div/div/div/div[2]/a";
            const help_element = document.evaluate(help_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (help_element) {
                help_element.parentNode.removeChild(help_element);
            }
            MDRun();
        } else if (!isPresent && wasXPathPresent) {
            //console.log("XPath disappeared!");
            handleXPathNotFound();
        }
        wasXPathPresent = isPresent; // Update the state
    }, 10);

    setInterval(() => {
        addNeo4jMenuItem();
    }, 60);
}