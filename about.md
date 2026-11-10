---
layout: page
title: "윤도현 (hellovkd)"
kicker: "PROFILE"
subtitle: "중부대학교 정보보호학전공"
permalink: /about/
---

{% assign profile = site.data.profile %}

## 학력 및 활동

<div class="about-timeline">
  {% for edu in profile.education %}
    <div class="about-timeline-card is-primary">
      <div class="about-timeline-top">
        <code class="about-period">{{ edu.period | escape }}</code>
        {% if edu.badge %}<span class="about-badge">{{ edu.badge | escape }}</span>{% endif %}
      </div>
      <h3>{{ edu.title | escape }}</h3>
    </div>
  {% endfor %}
  {% for item in profile.careers %}
    <div class="about-timeline-card">
      <div class="about-timeline-top">
        <code class="about-period">{{ item.period | escape }}</code>
        {% if item.badge %}<span class="about-badge">{{ item.badge | escape }}</span>{% endif %}
      </div>
      <h3>{{ item.title | escape }}</h3>
    </div>
  {% endfor %}
</div>

---

## 중요하게 생각하는 가치

{% for val in profile.values %}
1. **{{ val.title | escape }}** — {{ val.description | escape }}
{% endfor %}

---

## 채널 및 연락처

* **Email**: [`{{ site.email }}`](mailto:{{ site.email }})
{% for link in profile.links %}
* **{{ link.name | escape }}**: [{{ link.handle | escape }}]({{ link.url }})
{% endfor %}
