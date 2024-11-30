import "../../styles/faqs.css";

import { Collapse, Space } from "antd";
import Divider from "@mui/material/Divider";

const FAQs = () => {
  const question1 = `Psoriasis is a chronic, non-contagious autoimmune disease that
                causes rapid skin cell reproduction resulting in red, dry
                patches of thickened skin. The dry flakes and skin scales are
                thought to result from the rapid buildup of skin cells.
                Psoriasis commonly affects the skin of the elbows, knees, and
                scalp.`;
  const question2 = `Psoriasis is caused by an overactive immune system that triggers
                inflammation and flaking of the skin. The exact cause of
                psoriasis is unknown, but it is believed to be related to an
                immune system problem with cells in the body.`;

  const question3 = `The most common symptoms of psoriasis are red, dry, and scaly
                patches of skin. These patches can be itchy and painful. In
                severe cases, the patches may crack and bleed. Psoriasis can
                also affect the nails, causing them to become pitted and
                discolored.`;

  const question4 = `Psoriasis is usually diagnosed by a dermatologist based on the
                appearance of the skin. In some cases, a skin biopsy may be
                needed to confirm the diagnosis.`;

  const question5 = `Psoriasis is usually treated with topical medications,
                phototherapy, and systemic medications. Topical medications are
                applied directly to the skin, while phototherapy involves
                exposing the skin to ultraviolet.`;

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
                    label: "What is Psoriasis?", // this is the header
                    children: <p>{question1}</p>,
                  },
                ]}
              />

              <Collapse
                collapsible="header"
                ghost
                items={[
                  {
                    label: "What are the causes of Psoriasis?", // this is the header
                    children: <p>{question2}</p>,
                  },
                ]}
              />

              <Collapse
                collapsible="header"
                ghost
                items={[
                  {
                    label: "What are the symptoms of Psoriasis?", // this is the header
                    children: <p>{question3}</p>,
                  },
                ]}
              />

              <Collapse
                collapsible="header"
                ghost
                items={[
                  {
                    label: "How is Psoriasis diagnosed?", // this is the header
                    children: <p>{question4}</p>,
                  },
                ]}
              />

              <Collapse
                collapsible="header"
                ghost
                items={[
                  {
                    label: "How is Psoriasis treated?", // this is the header
                    children: <p>{question5}</p>,
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
