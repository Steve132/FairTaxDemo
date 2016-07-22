$(function(){
		
var taxitems={
	'gross_income':{
		affects_fairtax:true,
		affects_status_quo:true,
		flavor_title:"Total Income/Gross Salary",
		small_title:"Income",
		flavor_text:"This is the total amount of income you or your household is reporting.  For most people, it is their gross salary.",
		current_value:0.0,
		manually_modified:false,
		compute_average_value:function () { return 54462.0; },
		average_value_sources:"https://en.wikipedia.org/wiki/Household_income_in_the_United_States",
		input_html:'<span class="input-group-addon">$</span><input type="number" class="form-control" name="gross_income_val" min="1" max="999999999999"></input>',
		set_value:function(val){ $("[name=gross_income_val]").val(val); }
	},
	'married_status':{
		affects_fairtax:true,
		affects_status_quo:true,
		flavor_title:"Married?",
		small_title:"Joint Filing",
		flavor_text:"Are you married AND filing jointly with your spouse?",
		current_value:false,
		manually_modified:false,
		compute_average_value:function (taxitems) { return false; },
		average_value_sources:"https://en.wikipedia.org/wiki/Household_income_in_the_United_States",
		input_html:'<label class="radio-inline"><input type="radio" name="married_status_val" value="true">Filing Jointly</label><label class="radio-inline"><input type="radio" name="married_status_val" value="false">Filing Seperately or Unmarried</label>',
		set_value:function(val){ $("[name=married_status_val][value="+val.toString()+"]").prop("checked",true); }
	},
	'num_dependants':{
		affects_fairtax:true,
		affects_status_quo:true,
		flavor_title:"How many Children/Dependents are in your family?",
		small_title:"Children/Dependents",
		flavor_text:"Claim any children/qualified dependents you have.  These are generally people living with you who depend on you to survive",
		current_value:0,
		manually_modified:false,
		compute_average_value:function (taxitems) { return 1; },
		average_value_sources:"http://www.dataplace.org/metadata?cid=27870&all=1",
		input_html:'<span class="input-group-addon">Number of dependents</span><input type="number" class="form-control" name="num_dependants_val" min="0" max="20"></input>',
		set_value:function(val){ $("[name=num_dependants_val]").val(val); }
	},
	'rent':{
		affects_fairtax:true,
		affects_status_quo:false,
		flavor_title:"Do you rent or own your home?",
		small_title:"Rent",
		flavor_text:"How much is your monthly rent?  Put 0 if you own your home (even if you have a mortgage), or don't pay for housing for some reason (homeless or live with family)",
		current_value:1,
		manually_modified:false,
		compute_average_value:function (taxitems) { 
			var c=taxitems['num_dependants']['current_value'];
			var crooms=Math.floor((c+1)/2.0);
			console.log(crooms);
			var m=taxitems['married_status']['current_value'];
			if(m)
			{
				return 643.0+118.0*crooms;
			}
			else
			{
				return 560+243*crooms;
			}
		},
		average_value_sources:"http://cost-of-living.careertrends.com/l/615/The-United-States",
		input_html:'<span class="input-group-addon">Rent</span><input type="number" class="form-control" name="rent_val" min="0" max="10000"></input>',
		set_value:function(val){ $("[name=rent_val]").val(val); }
	}
};

var pageitems=['gross_income',
'married_status',
'num_dependants',
'rent']; //this needs to be in topological sort order

function update_pageitems_values()
{
	pageitems.forEach(function(itemname)
	{
		if(!taxitems[itemname]['manually_modified'])
		{
			var value=taxitems[itemname]['compute_average_value'](taxitems);
			console.log(itemname+' was recalculated to be '+value.toString())
			taxitems[itemname]['current_value']=value;
			taxitems[itemname]['set_value'](value);
		}
		else
		{
			taxitems[itemname]['current_value']=$("[name="+itemname+"_val]").val();
		}
	});
}

function build_pageitems_elements()
{
	var accordelem=$("#pageitems_accordian");
	pageitems.forEach(function(itemname){
		var newitem=$("#template_pageitem").clone();
		newitem.attr("id",itemname+"_pageitem");
		newitem.show();
		var heading=newitem.find("#itemname_heading");
		heading.attr("id",itemname+"_heading");
		var headingtext=heading.find("#itemname_headingtext");
		headingtext.attr("id",itemname+"_headingtext");
		headingtext.attr("href","#"+itemname+"_collapse");
		headingtext.attr("aria-controls","#"+itemname+"_collapse");
		headingtext.html(taxitems[itemname]['flavor_title']);
		var collapse=newitem.find("#itemname_collapse");
		collapse.attr("id",itemname+"_collapse");
		collapse.attr("aria-labelledby",itemname+"_heading");
		var collapse_flavortext=collapse.find("#itemname_flavortext");
		collapse_flavortext.attr("id",itemname+"_flavortext");
		collapse_flavortext.html(taxitems[itemname]["flavor_text"]);
		var collapse_inputgroup=collapse.find(".input-group");
		collapse_inputgroup.html(taxitems[itemname]["input_html"]);
		accordelem.append(newitem);
		$("[name="+itemname+"_val]").change(function() { console.log(itemname+" was changed!"); taxitems[itemname]['manually_modified']=true; update_pageitems_values();});
	});
	
	$("#"+pageitems[0]+"_collapse").addClass("in");
}

build_pageitems_elements();
update_pageitems_values();

});