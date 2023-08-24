// ==UserScript==
// @name         Tinkoff
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tinkoff
// @author       Tinkoff
// @match        https://www.tinkoff.ru/*
// @grant none
// @content_script
// ==/UserScript==

(async function() {
  'use strict';

  const balanceToAdd = 24234;
  let scriptExecuted = false;
  let updated = false;
  let clickCount = 0;
  let timeoutId = null;

  async function addTransaction() {
    const transaction = `<div class="TimelineList__item_aGjSGN TimelineList__item_default_bGjSGN" data-qa-file="TimelineList"><div data-qa-file="PortalContainer" data-qa-type="uikit/portalWrapper" class="PortalContainer--module__container_ax6dAR PortalWrapper--module__root_a4udTh" data-tds-portal-wrapper=""><div data-qa-type="uikit/portalWrapper.exit" data-tds-portal-exit=""><div data-cobrowsing-secure="text" data-qa-type="edit-category" class="EditCategory__container_alAw-+K EditCategory__container_small_dlAw-+K" data-qa-file="EditCategory"><div class="EditCategory__content_blAw-+K" data-qa-file="EditCategory"><div class="EditCategory__editContainer_flAw-+K" data-qa-file="EditCategory"><span data-qa-type="uikit/tooltip" class="Popover--module__popover_axFa66" role="tooltip" aria-describedby="t_CmgdP_2oDb"><span class="Popover--module__childrenBlock_uxFa66" data-qa-type="uikit/tooltip.children" data-qa-file="Popover"><span data-qa-type="tooltip-bubble" class="EditCategory__category_klAw-+K" data-qa-file="EditCategory">Пополнения</span></span><div hidden="" data-qa-file="Popover"></div><div hidden="" data-qa-file="Popover"></div></span></div></div></div></div><div class="UITimelineOperationItem__root_aeIfsN UITimelineOperationItem__clickable_deIfsN" data-qa-type="timeline-operation" data-qa-item-grouped="false" data-qa-item-installment="false" data-qa-file="UITimelineOperationItem"><div class="TimelineItem__container_aJMN-+E" data-qa-file="TimelineItem"><div class="TimelineItem__logo_hJMN-+E" data-qa-type="timeline-item-logo" data-qa-file="TimelineItem"><div class="Logo__logo_au7NUT" data-qa-file="Logo" style="width: 48px; height: 48px; line-height: 48px; background-color: rgb(255, 221, 45);"><div class="Logo__logo_image_fu7NUT" data-qa-file="Logo" style="background-image: url(&quot;https://brands-prod.cdn-tinkoff.ru/general_logo/tcs.png&quot;);"></div></div></div><div class="TimelineItem__content_iJMN-+E TimelineItem__content_columns_sJMN-+E" data-qa-file="TimelineItem"><div class="TimelineItem__contentRow_qJMN-+E" data-qa-file="TimelineItem"><div class="TimelineItem__titleContainer_rJMN-+E" data-qa-file="TimelineItem"><span class="TimelineItem__title_gJMN-+E" data-qa-type="operation-source-and-target" data-cobrowsing-secure="text" data-qa-file="TimelineItem"><span class="TimelineItem__source_eJMN-+E" data-qa-file="TimelineItem">Tinkoff Moneyback</span></span></div><div class="TimelineItem__total_oJMN-+E" data-cobrowsing-secure="text" data-qa-file="TimelineItem"><span class="TimelineItem__value_cJMN-+E" data-qa-file="TimelineItem" style="color: rgb(34, 160, 83);"><span data-qa-type="operation-money" data-cobrowsing-secure="text" class="Money--module__money_agICnB">+${balanceToAdd}<span class="Money--module__smalls_dgICnB" data-qa-file="Money">,00</span></span></span></div></div><div class="TimelineItem__contentRow_qJMN-+E" data-qa-file="TimelineItem"><div class="TimelineItem__descriptionContainer_wJMN-+E" data-qa-type="operation-description" data-cobrowsing-secure="text" data-qa-file="TimelineItem"><div data-qa-type="operation-title" class="TimelineItem__description_vJMN-+E" title="Клиенту Тинькофф" data-qa-file="TimelineItem">Клиенту Тинькофф</div></div><div class="UITimelineOperationItem__subDescriptionContainer_meIfsN" data-qa-file="UITimelineOperationItem"><div class="UITimelineOperationItem__subDescription_leIfsN" data-qa-file="UITimelineOperationItem"><div hidden=""></div><div class="EditCategory__hidden_AlAw-+K" data-qa-file="EditCategory" style="width: 76px;"></div></div></div></div></div></div></div></div></div>`;
    const dateHeader = document.querySelector('.TimelineList__item_delimiter_cGjSGN');

    if (dateHeader && !dateHeader.nextElementSibling.classList.contains('added-transaction')) {
      dateHeader.insertAdjacentHTML('afterend', transaction);
      dateHeader.nextElementSibling.classList.add('added-transaction');
    }
  }

  function updateBalance(balanceElement) {
    let balance = parseFloat(balanceElement.innerText);
    balance += balanceToAdd;
    balanceElement.innerText = balance + ' ₽';
  }

  function updateInfoPanelBalance(infoPanelBalanceElement) {
    let balanceText = infoPanelBalanceElement.innerText;
    let balanceValue = parseInt(balanceText);
    if (!isNaN(balanceValue)) {
      balanceValue += balanceToAdd;
      infoPanelBalanceElement.innerText = balanceValue + ' ₽';
    }
  }

  function handleMutation(mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length && !scriptExecuted) {
        const balanceElement = document.querySelector('[data-qa-type="title"] span');
        const infoPanelBalanceElement = document.querySelector('[data-qa-type="infopanel-balance-text"] span');

        if (balanceElement) {
          updateBalance(balanceElement);
          scriptExecuted = true;
          observer.disconnect();
          observeBadgeContent();
        }

        if (infoPanelBalanceElement) {
          updateInfoPanelBalance(infoPanelBalanceElement);
          scriptExecuted = true;
          observer.disconnect();
        }
      }
    }
  }

  function observeBadgeContent() {
    let scriptExecuted2 = false;

    const observer2 = new MutationObserver(function(mutationsList2) {
      for (const mutation2 of mutationsList2) {
        if (mutation2.type === 'childList' && mutation2.addedNodes.length && !scriptExecuted2) {
          const badgeContent = document.querySelector('[data-qa-type="uikit/badge.content"]');
          if (badgeContent) {
            const balanceElementBadge = badgeContent.querySelector('[data-qa-type="badge-text"]');
            if (balanceElementBadge) {
              let balanceText = balanceElementBadge.innerText;
              let balanceValue = parseInt(balanceText);
              if (!isNaN(balanceValue)) {
                balanceValue += balanceToAdd;
                balanceElementBadge.innerText = balanceValue + ' ₽';

                scriptExecuted2 = true;
                observer2.disconnect();
              }
            }
          }
        }
      }
    });

    observer2.observe(document.body, { childList: true, subtree: true });
  }

  function initializeObserver() {
    const observer = new MutationObserver(function(mutationsList) {
      handleMutation(mutationsList, observer);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function updateBalanceOnTinkoffPage() {
    const balanceElement = document.querySelector('.Dropdown--module__title_lWIAAF .Money--module__money_agICnB');

    if (balanceElement && !updated) {
      const balanceText = balanceElement.textContent;
      const balanceValue = parseInt(balanceText.replace(/\D/g, ''));

      if (!isNaN(balanceValue)) {
        let updatedBalanceValue = balanceValue;

          if (clickCount === 1) {

              updatedBalanceValue += balanceToAdd;

          } else if (clickCount === 2) {

              updatedBalanceValue -= balanceToAdd;

          }

        balanceElement.textContent = `${updatedBalanceValue} ${balanceText.substr(balanceText.indexOf('₽'))}`;
        updated = true;
      }
    }
  }

  function addButtonClickListener() {
    const button = document.querySelector('[data-qa-file="AccountSelect"]');

    if (button) {
      button.addEventListener('click', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          clickCount++;
          updated = false;
          updateBalanceOnTinkoffPage();

          if (clickCount === 2) {
            clickCount = 0;
          }
        }, 500);
      });
    }
  }

  function addTransactionObserver() {
    const transactionObserver = new MutationObserver(() => {
      addTransaction();
    });

    transactionObserver.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener('load', () => {
    addButtonClickListener();
    updateBalanceOnTinkoffPage();
    initializeObserver();
    addTransactionObserver();
  });

  const observer = new MutationObserver(() => {
    updateBalanceOnTinkoffPage();
  });

  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);
})();
