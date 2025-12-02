export function paginationHelper(currentPage, totalPages, total) {
  if (totalPages <= 1) return '';

  const containerClass =
    'px-4 py-2 bg-white border border-gray-200/60 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] ' +
    'hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out text-gray-900 font-medium';

  const activePageClass =
    'px-4 py-2 bg-blue-600 text-white rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.3)] font-medium';

  const disabledClass =
    'px-4 py-2 bg-gray-100 border border-gray-200/60 rounded-xl text-gray-400 font-medium cursor-not-allowed';

  // ------------------------------
  // Helper build URL with page param
  // ------------------------------
  const buildPageLink = (page, content, extraClass = '') => {
    return `
      <a 
        href="javascript:void(0);" 
        onclick="const url = new URL(window.location.href); url.searchParams.set('page', ${page}); window.location.href = url.toString(); return false;"
        class="${containerClass} ${extraClass}"
      >${content}</a>`;
  };

  // ------------------------------
  // Render previous button
  // ------------------------------
  const renderPrev = () => {
    if (currentPage <= 1) {
      return `
        <span class="${disabledClass} flex items-center gap-2">
          <i class="fas fa-chevron-left text-sm"></i> Previous
        </span>`;
    }

    return buildPageLink(
      currentPage - 1,
      `<i class="fas fa-chevron-left text-sm"></i> Previous`,
      'flex items-center gap-2'
    );
  };

  // ------------------------------
  // Render next button
  // ------------------------------
  const renderNext = () => {
    if (currentPage >= totalPages) {
      return `
        <span class="${disabledClass} flex items-center gap-2">
          Next <i class="fas fa-chevron-right text-sm"></i>
        </span>`;
    }

    return buildPageLink(
      currentPage + 1,
      `Next <i class="fas fa-chevron-right text-sm"></i>`,
      'flex items-center gap-2'
    );
  };

  // ------------------------------
  // Render a page number (active or normal)
  // ------------------------------
  const renderPageNumber = page => {
    if (page === currentPage) {
      return `<span class="${activePageClass}">${page}</span>`;
    }
    return buildPageLink(page, page);
  };

  const renderDots = () => `<span class="px-2 text-gray-400">...</span>`;

  // ------------------------------
  // Calculate range of pages to display
  // ------------------------------
  const maxPages = 7;
  let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
  let endPage = Math.min(totalPages, startPage + maxPages - 1);

  if (endPage - startPage < maxPages - 1) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  // ------------------------------
  // Build HTML
  // ------------------------------
  let pagesHtml = '';

  if (startPage > 1) {
    pagesHtml += renderPageNumber(1);
    if (startPage > 2) pagesHtml += renderDots();
  }

  for (let i = startPage; i <= endPage; i++) {
    pagesHtml += renderPageNumber(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pagesHtml += renderDots();
    pagesHtml += renderPageNumber(totalPages);
  }

  return `
    <div class="flex items-center justify-between gap-4 mt-6 px-4 pb-4">
      <div class="text-gray-600 text-sm">
        Showing ${currentPage} of ${totalPages} pages (${total} total items)
      </div>

      <div class="flex items-center gap-2">
        ${renderPrev()}
        ${pagesHtml}
        ${renderNext()}
      </div>
    </div>
  `;
}
