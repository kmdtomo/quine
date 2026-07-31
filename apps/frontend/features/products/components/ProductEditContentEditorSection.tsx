type ProductEditContentEditorSectionProps = {
  content: string;
  onContentChange: (value: string) => void;
  onSelectionChange: (selection: ProductEditContentSelection) => void;
};

export type ProductEditContentSelection = {
  end: number;
  start: number;
  text: string;
};

export function ProductEditContentEditorSection({
  content,
  onContentChange,
  onSelectionChange,
}: ProductEditContentEditorSectionProps) {
  function reportSelection(textarea: HTMLTextAreaElement) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    onSelectionChange({
      end,
      start,
      text: textarea.value.slice(start, end),
    });
  }

  return (
    <section className="flex flex-col gap-2 rounded-[8px] border border-white/[0.04] bg-[#212121] p-5">
      <h2 className="text-xs font-medium tracking-[0.08em] text-white uppercase">
        Content
      </h2>
      <label className="block rounded-[8px] bg-[#2A2A2A] p-px transition focus-within:bg-[linear-gradient(135deg,#11998E_0%,#07DE81_100%)]">
        <span className="sr-only">Content</span>
        <textarea
          className="min-h-[280px] w-full resize-y rounded-[7px] bg-[#0D0D0D] px-4 py-3 text-[15px] leading-[1.7] text-white outline-none placeholder:text-[#5C5C5C]"
          placeholder="What did you build? Why this architecture? What should other engineers notice?"
          value={content}
          onChange={(event) => {
            onContentChange(event.currentTarget.value);
            reportSelection(event.currentTarget);
          }}
          onFocus={(event) => reportSelection(event.currentTarget)}
          onKeyUp={(event) => reportSelection(event.currentTarget)}
          onMouseUp={(event) => reportSelection(event.currentTarget)}
          onSelect={(event) => reportSelection(event.currentTarget)}
        />
      </label>
    </section>
  );
}
