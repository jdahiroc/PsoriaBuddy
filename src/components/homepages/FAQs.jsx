import "../../styles/faqs.css";

import { Collapse, Space } from "antd";
import Divider from "@mui/material/Divider";

const FAQs = () => {
  const description_1 = `Psoriasis is a chronic, non-contagious autoimmune disease that
                causes rapid skin cell reproduction resulting in red, dry
                patches of thickened skin. The dry flakes and skin scales are
                thought to result from the rapid buildup of skin cells.
                Psoriasis commonly affects the skin of the elbows, knees, and
                scalp.`;
  const description_2 = `Psoriasis is caused by an overactive immune system that triggers
                inflammation and flaking of the skin. The exact cause of
                psoriasis is unknown, but it is believed to be related to an
                immune system problem with cells in the body.`;

  const description_3 = `The most common symptoms of psoriasis are red, dry, and scaly
                patches of skin. These patches can be itchy and painful. In
                severe cases, the patches may crack and bleed. Psoriasis can
                also affect the nails, causing them to become pitted and
                discolored.`;

  const description_4 = `Psoriasis is usually diagnosed by a dermatologist based on the
                appearance of the skin. In some cases, a skin biopsy may be
                needed to confirm the diagnosis.`;

  const description_5 = `Psoriasis is usually treated with topical medications,
                phototherapy, and systemic medications. Topical medications are
                applied directly to the skin, while phototherapy involves
                exposing the skin to ultraviolet.`;

  const description_6 = `The materials and information provided come directly from OroDerm and reflect the expertise and extensive experience of Dr. Neil S. Oropeza, M.D., FPDS. All content is carefully prepared, reviewed, and verified to ensure accuracy and uphold the highest standards in dermatological care and aesthetic treatments. Dr. Oropeza’s dedication to providing reliable and professional guidance is evident in every aspect of the information shared.

              <br> <br>  You can visit his clinics located in Davao, Cebu, Metro Manila, Zamboanga, General Santos (Gensan), Cotabato, Cagayan de Oro (CDO), Butuan, Bacolod, and Tagum, Philippines. <br> <br>For more details, you can also visit their official Facebook page at <a href="https://www.facebook.com/orodermofficial" target="_blank">https://www.facebook.com/orodermofficial</a>.`;

  return (
    <>
      <div className="faqs-container">
        <div className="faqs-content">
          {/* heading */}
          <div className="faqs-heading">
            <h1>Frequently Asked Questions</h1>
          </div>
          {/* divider */}
          <Divider variant="middle" />
          {/* faqs question */}
          <div className="faqs-questions-content">
            <Space direction="vertical">
              <Collapse
                collapsible="header"
                defaultActiveKey={["1"]}
                ghost
                items={[
                  {
                    key: "1",
                    label: "Where does this information come from?", // this is the header
                    children: (
                      <p dangerouslySetInnerHTML={{ __html: description_6 }} />
                    ),
                  },
                ]}
              />
              <Collapse
                collapsible="header"
                defaultActiveKey={["2"]}
                ghost
                items={[
                  {
                    key: "2",
                    label: "What is Psoriasis?", // this is the header
                    children: <p>{description_1}</p>,
                  },
                ]}
              />

              <Collapse
                collapsible="header"
                ghost
                items={[
                  {
                    label: "What are the causes of Psoriasis?", // this is the header
                    children: <p>{description_2}</p>,
                  },
                ]}
              />

              <Collapse
                collapsible="header"
                ghost
                items={[
                  {
                    label: "What are the symptoms of Psoriasis?", // this is the header
                    children: <p>{description_3}</p>,
                  },
                ]}
              />

              <Collapse
                collapsible="header"
                ghost
                items={[
                  {
                    label: "How is Psoriasis diagnosed?", // this is the header
                    children: <p>{description_4}</p>,
                  },
                ]}
              />

              <Collapse
                collapsible="header"
                ghost
                items={[
                  {
                    label: "How is Psoriasis treated?", // this is the header
                    children: <p>{description_5}</p>,
                  },
                ]}
              />
            </Space>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQs;
