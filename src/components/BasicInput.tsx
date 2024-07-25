const BasicInput = ({ id, text, setter, value }) => {
  return (
    <>
      <div className="py-2">
        <input
          id={id}
          type="text"
          placeholder={text}
          className="border-form-stroke text-body-color placeholder-body-color focus:border-primary active:border-primary w-full rounded-lg border-[1.5px] py-3 px-5 font-medium outline-none transition disabled:cursor-default disabled:bg-[#F5F7FD]"
          onChange={(e) => setter(e.target.value)}
          value={value}
        />
      </div>
    </>
  );
};
export default BasicInput;
