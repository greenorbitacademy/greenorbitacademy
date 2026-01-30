export default function TicketTailorWidget() {
  return (
    <div className="tt-widget">
      <div className="tt-widget-fallback">
        <p>
          <a
            href="https://www.tickettailor.com/all-tickets/greenorbitacademy/?ref=website_widget&show_search_filter=true&show_date_filter=true&show_sort=true"
            target="_blank"
            rel="noopener"
          >
            Click here to buy tickets
          </a>
          <br />
          <small>
            <a
              href="https://www.tickettailor.com?rf=wdg_224836"
              className="tt-widget-powered"
            >
              Sell tickets online with Ticket Tailor
            </a>
          </small>
        </p>
      </div>
      <script
        src="https://cdn.tickettailor.com/js/widgets/min/widget.js"
        data-url="https://www.tickettailor.com/all-tickets/greenorbitacademy/?ref=website_widget&show_search_filter=true&show_date_filter=true&show_sort=true"
        data-type="inline"
        data-inline-minimal="false"
        data-inline-show-logo="true"
        data-inline-bg-fill="true"
        data-inline-inherit-ref-from-url-param=""
        data-inline-ref="website_widget"
      ></script>
    </div>
  );
}