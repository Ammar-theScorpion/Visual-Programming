from django import template
from django.template.defaultfilters import stringfilter
from django.utils.html import conditional_escape, mark_safe,escape


register = template.Library()

@register.filter
def lower(value):
    if isinstance(value, str):
        return value.lower()
    return value


@register.filter(is_safe=True)
@stringfilter
def get_first(string_list, num=0):
    first=''
    for i in string_list:
        if len(i) >= num and i[num-1].isalpha():
            first+=i[num-1]
        else:
            first+=" "

    return first

#limited to asingle value
@register.filter(needs_autoscape=True)
@stringfilter#as string
def letter_count(string, letter, autoscape=True):
    if autoscape:
        string = conditional_escape(string)
    
    result= {f"<i>{string}</i> has {string.count(letter)}"}
    return mark_safe(result)#string-html

#tags operate on blocks of code---{% comment %}


@register.simple_tag
def comment(*args):
    return ""

@register.simple_tag
def make_ul(list):
    content = ['<ul>']
    for i in list:
        content.append(f"<li><i>{escape(i)}</i></li>")
    content.append('</ul>')
    
    content=''.join(content)
    return mark_safe(content)


@register.simple_tag(takes_context=True)
def custom_context(context, title):#fill in tage
    output = [f"<i>{title}</i>"]
    li = context['dinos']
    
    for i in li['l']:
        output.append(f"<i>{escape(i)}</i> ")

    output.append('</ul>')
    context['change'] = 'changed value'
    return mark_safe(''.join(output))
   