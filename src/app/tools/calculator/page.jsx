"use client";
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, BorderStyle, WidthType, AlignmentType } from 'docx';
import _ from 'lodash';

// Component for AWS Cost Checklist
const AWSCostChecklist = () => {
  // State for loading status of PDF/DOCX libraries
  const [librariesLoaded, setLibrariesLoaded] = useState({
    pdf: false,
    docx: false
  });
  
  // Libraries will be stored here when loaded
  const [libs, setLibs] = useState({
    jspdf: null,
    docx: null
  });

  // Light/Dark mode toggle
  const [darkMode, setDarkMode] = useState(false);

  // Load libraries dynamically on client side
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        // Load jsPDF - make sure we get a proper constructor
        const jsPDFModule = await import('jspdf');
        const jsPDFConstructor = jsPDFModule.default || jsPDFModule.jsPDF;
        
        // Create a test instance to ensure the constructor works
        const testDoc = new jsPDFConstructor();
        console.log("jsPDF loaded successfully", testDoc);
        
        // Load docx
        const docxModule = await import('docx');
        
        // Set the libraries first before attempting to initialize autotable
        setLibs({
          jspdf: jsPDFConstructor,
          docx: docxModule
        });
        
        // Now load autotable separately
        try {
          // Import the autotable module
          await import('jspdf-autotable').then(autoTableModule => {
            console.log("Autotable module loaded", autoTableModule);
            // AutoTable will register itself with the jsPDF prototype
            // No need to manually call a function to attach it
          });
          console.log("AutoTable loaded successfully");
        } catch (autoTableError) {
          console.error("Error loading AutoTable:", autoTableError);
          // Continue anyway - we can use the manual table approach as fallback
        }
        
        setLibrariesLoaded({
          pdf: true,
          docx: true
        });
        
        console.log("Libraries loaded successfully");
      } catch (error) {
        console.error("Error loading libraries:", error);
        alert("Some document generation features might not be available. Please make sure you have jspdf and docx installed.");
      }
    };
    
    loadLibraries();

    // Check for preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Data structure for checklist categories and items
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "Account & Billing Setup",
      icon: "💰",
      expanded: true,
      items: [
        { id: "1-1", text: "Activate AWS Cost Explorer", checked: false },
        { id: "1-2", text: "Set up AWS Budgets and alerts", checked: false },
        { id: "1-3", text: "Enable detailed billing reports to S3", checked: false },
        { id: "1-4", text: "Implement resource tagging strategy for cost allocation", checked: false },
        { id: "1-5", text: "Consolidate accounts with AWS Organizations", checked: false },
        { id: "1-6", text: "Review IAM roles and access to billing information", checked: false },
        { id: "1-7", text: "Enable AWS Trusted Advisor cost optimization checks", checked: false },
        { id: "1-8", text: "Set up anomaly detection for unusual spending patterns", checked: false }
      ]
    },
    {
      id: 2,
      title: "Compute Services Optimization",
      icon: "⚙️",
      expanded: false,
      subsections: [
        {
          id: "2-1",
          title: "EC2",
          items: [
            { id: "2-1-1", text: "Identify and terminate unused or idle instances", checked: false },
            { id: "2-1-2", text: "Right-size over-provisioned instances", checked: false },
            { id: "2-1-3", text: "Implement auto-scaling for variable workloads", checked: false },
            { id: "2-1-4", text: "Use Spot Instances for non-critical, interruptible workloads", checked: false },
            { id: "2-1-5", text: "Purchase Reserved Instances or Savings Plans for predictable workloads", checked: false },
            { id: "2-1-6", text: "Evaluate Graviton ARM-based instances for better price/performance", checked: false },
            { id: "2-1-7", text: "Optimize EBS volumes (size, type, and unused volumes)", checked: false },
            { id: "2-1-8", text: "Remove unattached EBS volumes and unused snapshots", checked: false },
            { id: "2-1-9", text: "Implement lifecycle policies for EBS snapshots", checked: false }
          ]
        },
        {
          id: "2-2",
          title: "Lambda",
          items: [
            { id: "2-2-1", text: "Optimize memory allocation for Lambda functions", checked: false },
            { id: "2-2-2", text: "Analyze function timeout settings and execution durations", checked: false },
            { id: "2-2-3", text: "Review and optimize trigger frequencies", checked: false },
            { id: "2-2-4", text: "Check for recursive invocation patterns", checked: false },
            { id: "2-2-5", text: "Monitor cold starts and implement provisioned concurrency if needed", checked: false }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Storage Optimization",
      icon: "💾",
      expanded: false,
      subsections: [
        {
          id: "3-1",
          title: "S3",
          items: [
            { id: "3-1-1", text: "Implement S3 lifecycle policies for proper tiering", checked: false },
            { id: "3-1-2", text: "Move infrequently accessed data to S3 Standard-IA", checked: false },
            { id: "3-1-3", text: "Move archival data to Glacier or Glacier Deep Archive", checked: false },
            { id: "3-1-4", text: "Enable S3 analytics to identify optimization opportunities", checked: false },
            { id: "3-1-5", text: "Review and delete unneeded objects/buckets", checked: false },
            { id: "3-1-6", text: "Optimize S3 request costs (batch operations vs. individual requests)", checked: false },
            { id: "3-1-7", text: "Review S3 replication needs and costs", checked: false }
          ]
        },
        {
          id: "3-2",
          title: "EBS & EFS",
          items: [
            { id: "3-2-1", text: "Audit EBS volumes for appropriate type (gp2, gp3, io1, etc.)", checked: false },
            { id: "3-2-2", text: "Convert from gp2 to gp3 where appropriate for cost savings", checked: false },
            { id: "3-2-3", text: "Delete unattached volumes and unnecessary snapshots", checked: false },
            { id: "3-2-4", text: "Implement EBS lifecycle management", checked: false },
            { id: "3-2-5", text: "Review EFS storage class and lifecycle policies", checked: false }
          ]
        }
      ]
    },
    {
      id: 4,
      title: "Database Services",
      icon: "🗄️",
      expanded: false,
      items: [
        { id: "4-1", text: "Right-size RDS instances", checked: false },
        { id: "4-2", text: "Convert to Aurora if workload is suitable", checked: false },
        { id: "4-3", text: "Review and adjust provisioned IOPS", checked: false },
        { id: "4-4", text: "Implement RDS reserved instances for steady workloads", checked: false },
        { id: "4-5", text: "Assess if read replicas are necessary", checked: false },
        { id: "4-6", text: "Evaluate multi-AZ deployment necessity", checked: false },
        { id: "4-7", text: "Review DynamoDB provisioned capacity vs. on-demand pricing", checked: false },
        { id: "4-8", text: "Implement DynamoDB auto-scaling", checked: false },
        { id: "4-9", text: "Use DynamoDB Accelerator (DAX) only when necessary", checked: false },
        { id: "4-10", text: "Review ElastiCache instance sizes and types", checked: false }
      ]
    },
    {
      id: 5,
      title: "Networking",
      icon: "🌐",
      expanded: false,
      items: [
        { id: "5-1", text: "Audit and remove unused Elastic IPs", checked: false },
        { id: "5-2", text: "Review and optimize NAT Gateway usage", checked: false },
        { id: "5-3", text: "Analyze data transfer costs between services and regions", checked: false },
        { id: "5-4", text: "Implement VPC Endpoints for AWS service access to reduce NAT costs", checked: false },
        { id: "5-5", text: "Consolidate workloads in fewer regions when possible", checked: false },
        { id: "5-6", text: "Optimize CloudFront usage and distribution settings", checked: false },
        { id: "5-7", text: "Review Route 53 query volumes and zones", checked: false }
      ]
    },
    {
      id: 6,
      title: "Application & Container Services",
      icon: "📦",
      expanded: false,
      items: [
        { id: "6-1", text: "Optimize ECS/EKS cluster sizes", checked: false },
        { id: "6-2", text: "Use Fargate Spot for non-critical workloads", checked: false },
        { id: "6-3", text: "Review and adjust App Runner service sizes", checked: false },
        { id: "6-4", text: "Audit container image sizes to reduce storage costs", checked: false },
        { id: "6-5", text: "Optimize container resource allocations (CPU/memory)", checked: false }
      ]
    },
    {
      id: 7,
      title: "Analytics & Big Data",
      icon: "📊",
      expanded: false,
      items: [
        { id: "7-1", text: "Review EMR cluster types and sizes", checked: false },
        { id: "7-2", text: "Use spot instances for EMR processing tasks", checked: false },
        { id: "7-3", text: "Implement autoscaling for variable workloads", checked: false },
        { id: "7-4", text: "Audit Redshift node types and cluster sizes", checked: false },
        { id: "7-5", text: "Evaluate Redshift Reserved Nodes for steady workloads", checked: false },
        { id: "7-6", text: "Review Kinesis shard counts and provisioning", checked: false },
        { id: "7-7", text: "Optimize Glue DPU usage and job concurrency", checked: false }
      ]
    },
    {
      id: 8,
      title: "Machine Learning & AI Services",
      icon: "🤖",
      expanded: false,
      items: [
        { id: "8-1", text: "Audit SageMaker instance types and usage", checked: false },
        { id: "8-2", text: "Review inference endpoint sizing and scaling policies", checked: false },
        { id: "8-3", text: "Use spot instances for training when possible", checked: false },
        { id: "8-4", text: "Implement model compression techniques", checked: false },
        { id: "8-5", text: "Evaluate pay-per-use AI services vs. custom models", checked: false }
      ]
    },
    {
      id: 9,
      title: "Monitoring & Management",
      icon: "📈",
      expanded: false,
      items: [
        { id: "9-1", text: "Review CloudWatch log retention periods", checked: false },
        { id: "9-2", text: "Audit CloudWatch metrics and custom metrics usage", checked: false },
        { id: "9-3", text: "Optimize X-Ray sampling rates", checked: false },
        { id: "9-4", text: "Review AWS Config recording settings", checked: false },
        { id: "9-5", text: "Evaluate CloudTrail trail configurations", checked: false }
      ]
    },
    {
      id: 10,
      title: "Advanced Optimization Strategies",
      icon: "🚀",
      expanded: false,
      items: [
        { id: "10-1", text: "Implement Infrastructure as Code for consistent deployments", checked: false },
        { id: "10-2", text: "Review architectural patterns for cost efficiency", checked: false },
        { id: "10-3", text: "Evaluate multi-account strategy effectiveness", checked: false },
        { id: "10-4", text: "Consider AWS Enterprise Discount Program (EDP) for large deployments", checked: false },
        { id: "10-5", text: "Implement FinOps practices and team structure", checked: false },
        { id: "10-6", text: "Schedule non-production environments for automatic shutdown", checked: false },
        { id: "10-7", text: "Evaluate third-party cost optimization tools", checked: false }
      ]
    },
    {
      id: 11,
      title: "Regular Review Process",
      icon: "🔄",
      expanded: false,
      items: [
        { id: "11-1", text: "Schedule weekly cost anomaly reviews", checked: false },
        { id: "11-2", text: "Conduct monthly service-specific optimization reviews", checked: false },
        { id: "11-3", text: "Perform quarterly comprehensive cost analysis", checked: false },
        { id: "11-4", text: "Review AWS pricing changes and new service offerings", checked: false },
        { id: "11-5", text: "Update internal chargeback/showback model", checked: false },
        { id: "11-6", text: "Track and celebrate cost optimization wins", checked: false }
      ]
    }
  ]);

  // Calculate overall progress
  const calculateProgress = () => {
    let totalItems = 0;
    let checkedItems = 0;
    
    sections.forEach(section => {
      if (section.items) {
        totalItems += section.items.length;
        checkedItems += section.items.filter(item => item.checked).length;
      }
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          totalItems += subsection.items.length;
          checkedItems += subsection.items.filter(item => item.checked).length;
        });
      }
    });
    
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  };
  
  // Get optimization score rating based on progress
  const getScoreRating = (progress) => {
    if (progress >= 90) return { label: "Excellent", color: "text-emerald-600", bgColor: "bg-emerald-100", darkBgColor: "dark:bg-emerald-900/30", description: "Your AWS environment is highly optimized. Keep maintaining these practices!" };
    if (progress >= 75) return { label: "Very Good", color: "text-green-600", bgColor: "bg-green-100", darkBgColor: "dark:bg-green-900/30", description: "Your cost optimization efforts are paying off. Look at remaining items for additional savings." };
    if (progress >= 60) return { label: "Good", color: "text-blue-600", bgColor: "bg-blue-100", darkBgColor: "dark:bg-blue-900/30", description: "You've made good progress. Several optimization opportunities still remain." };
    if (progress >= 40) return { label: "Fair", color: "text-amber-600", bgColor: "bg-amber-100", darkBgColor: "dark:bg-amber-900/30", description: "You've completed some key optimizations. Focus on high-impact items next." };
    if (progress >= 20) return { label: "Getting Started", color: "text-orange-600", bgColor: "bg-orange-100", darkBgColor: "dark:bg-orange-900/30", description: "You're on the right path. Prioritize the easier wins first." };
    return { label: "Needs Attention", color: "text-rose-600", bgColor: "bg-rose-100", darkBgColor: "dark:bg-rose-900/30", description: "Begin your optimization journey with quick wins for immediate savings." };
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, expanded: !section.expanded } 
        : section
    ));
  };
  
  // Calculate section progress
  const calculateSectionProgress = (section) => {
    let totalItems = 0;
    let checkedItems = 0;
    
    if (section.items) {
      totalItems += section.items.length;
      checkedItems += section.items.filter(item => item.checked).length;
    }
    
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        totalItems += subsection.items.length;
        checkedItems += subsection.items.filter(item => item.checked).length;
      });
    }
    
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  };

  // Toggle item check state with animation
  const toggleItem = (itemId, sectionId, subsectionId = null) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        if (subsectionId) {
          return {
            ...section,
            subsections: section.subsections.map(subsection => 
              subsection.id === subsectionId 
                ? {
                    ...subsection,
                    items: subsection.items.map(item => 
                      item.id === itemId 
                        ? { ...item, checked: !item.checked } 
                        : item
                    )
                  }
                : subsection
            )
          };
        } else {
          return {
            ...section,
            items: section.items.map(item => 
              item.id === itemId 
                ? { ...item, checked: !item.checked } 
                : item
            )
          };
        }
      }
      return section;
    }));
  };

  // Reset all checkboxes
  const resetChecklist = () => {
    const resetItems = (items) => items.map(item => ({ ...item, checked: false }));
    
    setSections(sections.map(section => {
      const updatedSection = { ...section };
      
      if (updatedSection.items) {
        updatedSection.items = resetItems(updatedSection.items);
      }
      
      if (updatedSection.subsections) {
        updatedSection.subsections = updatedSection.subsections.map(subsection => ({
          ...subsection,
          items: resetItems(subsection.items)
        }));
      }
      
      return updatedSection;
    }));
  };

  // Export checklist state
  const exportChecklist = () => {
    const checklistData = {
      title: "AWS Cost Analysis & Optimization Checklist",
      date: new Date().toISOString(),
      progress: calculateProgress(),
      scoreRating: getScoreRating(calculateProgress()).label,
      sections: sections
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(checklistData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "aws_cost_checklist.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Generate and download PDF
  const downloadAsPDF = () => {
    if (!librariesLoaded.pdf) {
      alert("PDF library is still loading or not available. Please try again in a few moments.");
      return;
    }
    
    try {
      console.log("Starting PDF generation...");
      const jsPDFConstructor = libs.jspdf;
      
      if (!jsPDFConstructor) {
        throw new Error("jsPDF library is not properly loaded");
      }
      
      // Create a new document
      const doc = new jsPDFConstructor({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Test if the document was created successfully
      console.log("PDF instance created");
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(15, 60, 100);
      doc.text('AWS Cost Analysis & Optimization Checklist', 15, 20);
      
      // Add date
      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${date}`, 15, 28);
      
      // Add overall progress
      const progress = calculateProgress();
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Overall Optimization Score: ${progress}%`, 20, 43);
      
      // Create a simple summary instead of a complex table
      doc.setFontSize(14);
      doc.text("Section Summaries:", 15, 60);
      
      // List sections with their progress
      let yPos = 70;
      sections.forEach(section => {
        const sectionProgress = calculateSectionProgress(section);
        doc.setFontSize(11);
        doc.text(`${section.title}: ${sectionProgress}%`, 20, yPos);
        yPos += 8;
        
        // Prevent overflow to next page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Save PDF
      console.log("Saving PDF...");
      doc.save(`aws_cost_optimization_summary_${date.replace(/\//g, '-')}.pdf`);
      console.log("PDF saved successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`There was an error generating the PDF: ${error.message}. Check the console for details.`);
    }
  };
  
  // Generate and download DOCX
  const downloadAsDOCX = async () => {
    if (!librariesLoaded.docx) {
      alert("DOCX library is still loading or not available. Please try again in a few moments.");
      return;
    }
    
    try {
      console.log("Starting DOCX generation...");
      const { docx } = libs;
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, WidthType, AlignmentType } = docx;
      
      const progress = calculateProgress();
      const scoreRating = getScoreRating(progress);
      const date = new Date().toLocaleDateString();
      
      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Title
              new Paragraph({
                text: "AWS Cost Analysis & Optimization Checklist",
                heading: HeadingLevel.HEADING_1,
                spacing: {
                  after: 200
                }
              }),
              
              // Date
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Generated on ${date}`,
                    color: "666666"
                  })
                ],
                spacing: {
                  after: 400
                }
              }),
              
              // Overall Score Section
              new Paragraph({
                text: `Overall Optimization Score: ${progress}%`,
                heading: HeadingLevel.HEADING_2,
                spacing: {
                  after: 200
                }
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Rating: ${scoreRating.label}`,
                    bold: true,
                    size: 28,
                    color: progress < 30 ? "FF0000" : progress < 70 ? "FF8C00" : "008000"
                  })
                ],
                spacing: {
                  after: 200
                }
              }),
              
              new Paragraph({
                text: scoreRating.description,
                spacing: {
                  after: 400
                }
              }),
              
              // Section Breakdown header
              new Paragraph({
                text: "Section Breakdown",
                heading: HeadingLevel.HEADING_2,
                spacing: {
                  after: 200
                }
              }),
            ]
          }
        ]
      });
      
      // Create section breakdown table
      const sectionRows = sections.map(section => {
        const sectionProgress = calculateSectionProgress(section);
        const sectionRating = getScoreRating(sectionProgress).label;
        
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({text: section.title})],
              width: {
                size: 60,
                type: WidthType.PERCENTAGE
              }
            }),
            new TableCell({
              children: [new Paragraph({
                text: `${sectionProgress}%`,
                alignment: AlignmentType.CENTER
              })],
              width: {
                size: 20,
                type: WidthType.PERCENTAGE
              }
            }),
            new TableCell({
              children: [new Paragraph({
                text: sectionRating,
                alignment: AlignmentType.CENTER
              })],
              width: {
                size: 20,
                type: WidthType.PERCENTAGE
              }
            })
          ]
        });
      });
      
      // Add table to document
      const sectionTable = new Table({
        rows: [
          // Header row
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({text: "Section", bold: true})],
                shading: {
                  fill: "2A5885"
                }
              }),
              new TableCell({
                children: [new Paragraph({text: "Progress", bold: true})],
                shading: {
                  fill: "2A5885"
                }
              }),
              new TableCell({
                children: [new Paragraph({text: "Rating", bold: true})],
                shading: {
                  fill: "2A5885"
                }
              })
            ]
          }),
          ...sectionRows
        ],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        }
      });
      
      doc.addSection({
        children: [sectionTable]
      });
      
      // Add detailed checklist for each section
      sections.forEach(section => {
        // Section title
        const sectionParagraph = new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_3,
          spacing: {
            before: 400,
            after: 200
          }
        });
        
        doc.addSection({
          children: [sectionParagraph]
        });
        
        // Section items
        if (section.items) {
          section.items.forEach(item => {
            const itemParagraph = new Paragraph({
              children: [
                new TextRun({
                  text: item.checked ? "☑ " : "☐ ",
                  bold: true
                }),
                new TextRun({
                  text: item.text,
                  strike: item.checked,
                  color: item.checked ? "999999" : "000000"
                })
              ],
              spacing: {
                before: 100,
                after: 100
              },
              indent: {
                left: 720
              }
            });
            
            doc.addParagraph(itemParagraph);
          });
        }
        
        // Subsections
        if (section.subsections) {
          section.subsections.forEach(subsection => {
            // Subsection title
            const subsectionParagraph = new Paragraph({
              text: subsection.title,
              heading: HeadingLevel.HEADING_4,
              spacing: {
                before: 300,
                after: 200
              },
              indent: {
                left: 720
              }
            });
            
            doc.addParagraph(subsectionParagraph);
            
            // Subsection items
            subsection.items.forEach(item => {
              const itemParagraph = new Paragraph({
                children: [
                  new TextRun({
                    text: item.checked ? "☑ " : "☐ ",
                    bold: true
                  }),
                  new TextRun({
                    text: item.text,
                    strike: item.checked,
                    color: item.checked ? "999999" : "000000"
                  })
                ],
                spacing: {
                  before: 100,
                  after: 100
                },
                indent: {
                  left: 1440
                }
              });
              
              doc.addParagraph(itemParagraph);
            });
          });
        }
      });
      
      // Generate and download the document
      console.log("Creating DOCX blob...");
      Packer.toBlob(doc).then(blob => {
        console.log("DOCX blob created, preparing download...");
        const url = URL.createObjectURL(blob);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", url);
        downloadAnchorNode.setAttribute("download", `aws_cost_optimization_report_${date.replace(/\//g, '-')}.docx`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        URL.revokeObjectURL(url);
        console.log("DOCX downloaded successfully!");
      });
    } catch (error) {
      console.error("Error generating DOCX:", error);
      alert("There was an error generating the DOCX. Please check the console for details.");
    }
  };

  const progress = calculateProgress();
  const scoreRating = getScoreRating(progress);

  // Toggle dark mode manually
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`font-sans antialiased transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto p-4 min-h-screen">
        <header className={`relative overflow-hidden rounded-xl shadow-lg mb-8 ${darkMode ? 'bg-indigo-900' : 'bg-gradient-to-r from-indigo-600 to-blue-500'}`}>
          <div className="absolute inset-0 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 20 L40 20 M20 0 L20 40" stroke="white" strokeWidth="1" fill="none"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pattern)"/>
            </svg>
          </div>
          <div className="relative p-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AWS Cost Analysis & Optimization</h1>
                <p className="text-indigo-100 opacity-90 max-w-xl">Track your AWS cost optimization progress with this interactive checklist and improve your cloud spending efficiency</p>
              </div>
              <button 
                onClick={toggleDarkMode} 
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-white/20 text-white'} transition-all duration-300`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs font-medium">
              <div className={`${darkMode ? 'bg-emerald-900/40' : 'bg-emerald-500'} text-white px-3 py-2 rounded-lg`}>Excellent: 90%+</div>
              <div className={`${darkMode ? 'bg-green-900/40' : 'bg-green-500'} text-white px-3 py-2 rounded-lg`}>Very Good: 75-89%</div>
              <div className={`${darkMode ? 'bg-blue-900/40' : 'bg-blue-500'} text-white px-3 py-2 rounded-lg`}>Good: 60-74%</div>
              <div className={`${darkMode ? 'bg-amber-900/40' : 'bg-amber-500'} text-white px-3 py-2 rounded-lg`}>Fair: 40-59%</div>
              <div className={`${darkMode ? 'bg-orange-900/40' : 'bg-orange-500'} text-white px-3 py-2 rounded-lg`}>Starting: 20-39%</div>
              <div className={`${darkMode ? 'bg-rose-900/40' : 'bg-rose-500'} text-white px-3 py-2 rounded-lg`}>Needs Work: 0-19%</div>
            </div>
          </div>
        </header>

        <div className={`rounded-xl shadow-lg mb-8 overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="w-full md:w-2/3 mb-6 md:mb-0">
                <div className="flex flex-wrap items-center mb-4 gap-3">
                  <h2 className="text-2xl font-bold">Overall Progress</h2>
                  <div className={`px-4 py-1 rounded-full text-sm font-semibold ${scoreRating.color} ${scoreRating.bgColor} ${darkMode ? scoreRating.darkBgColor : ''}`}>
                    {scoreRating.label}
                  </div>
                </div>
                
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-8 relative mb-2 overflow-hidden`}>
                  <div 
                    className="h-8 rounded-full transition-all duration-700 ease-out-cubic flex items-center justify-center relative"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: progress < 30 ? (darkMode ? '#ef444480' : '#EF4444') : 
                                    progress < 70 ? (darkMode ? '#f59e0b80' : '#F59E0B') : 
                                    (darkMode ? '#10b98180' : '#10B981')
                    }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-xs md:text-sm font-medium text-white drop-shadow">
                      {progress}%
                    </span>
                  </div>
                  
                  {/* Milestone markers */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {[20, 40, 60, 80].map(milestone => (
                      <div 
                        key={milestone}
                        className={`absolute top-0 bottom-0 w-px ${darkMode ? 'bg-gray-500' : 'bg-gray-400'} z-10`}
                        style={{ left: `${milestone}%` }}
                      >
                        <div className={`absolute -top-6 transform -translate-x-1/2 ${darkMode ? 'bg-gray-700' : 'bg-gray-600'} text-white text-xs py-1 px-2 rounded`}>
                          {milestone}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{scoreRating.description}</p>
              </div>
              
              <div className="flex flex-col p-4 justify-center space-y-2 md:space-y-0 md:flex-row md:space-x-3 flex-wrap">
                <button 
                  onClick={resetChecklist}
                  className={`m-2 group px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-all duration-200 
                    ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                    className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-180">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-2.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Reset All
                </button>
                <button 
                  onClick={exportChecklist}
                  className={`m-2 px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-all duration-200
                    ${darkMode ? 'bg-indigo-900 hover:bg-indigo-800 text-indigo-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  Export Data
                </button>
                <button 
                  onClick={downloadAsPDF}
                  className={`m-2 px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-all duration-200
                    ${!librariesLoaded.pdf 
                      ? (darkMode ? 'bg-red-900/50 cursor-not-allowed text-red-300' : 'bg-red-300 cursor-not-allowed text-white') 
                      : (darkMode ? 'bg-red-900 hover:bg-red-800 text-red-100' : 'bg-red-600 hover:bg-red-700 text-white')}`}
                  disabled={!librariesLoaded.pdf}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  {librariesLoaded.pdf ? 'Download PDF' : 'Loading PDF...'}
                </button>
                <button 
                  onClick={downloadAsDOCX}
                  className={`m-4 px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-all duration-200
                    ${!librariesLoaded.docx 
                      ? (darkMode ? 'bg-blue-900/50 cursor-not-allowed text-blue-300' : 'bg-blue-300 cursor-not-allowed text-white')
                      : (darkMode ? 'bg-blue-900 hover:bg-blue-800 text-blue-100' : 'bg-blue-600 hover:bg-blue-700 text-white')}`}
                  disabled={!librariesLoaded.docx}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  {librariesLoaded.docx ? 'Download DOCX' : 'Loading DOCX...'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.id} className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <button 
                className={`w-full px-5 py-4 text-left transition-colors duration-200 flex justify-between items-center
                  ${darkMode 
                    ? (section.expanded ? 'bg-indigo-900/20' : 'hover:bg-gray-700') 
                    : (section.expanded ? 'bg-indigo-50' : 'hover:bg-gray-50')}`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl md:text-2xl" aria-hidden="true">{section.icon}</span>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold">{section.title}</h2>
                    
                    {/* Section progress and rating on small screens */}
                    <div className="md:hidden flex items-center mt-1 gap-2">
                      <div className={`w-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} h-1.5 rounded-full mr-1`}>
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            width: `${calculateSectionProgress(section)}%`,
                            backgroundColor: 
                              calculateSectionProgress(section) < 30 ? (darkMode ? '#ef444480' : '#EF4444') : 
                              calculateSectionProgress(section) < 70 ? (darkMode ? '#f59e0b80' : '#F59E0B') : 
                              (darkMode ? '#10b98180' : '#10B981')
                          }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        calculateSectionProgress(section) < 30 ? 'text-rose-500' : 
                        calculateSectionProgress(section) < 70 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {calculateSectionProgress(section)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Section progress and rating on medium and larger screens */}
                  <div className="hidden md:flex items-center gap-3 ml-4">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 h-2 rounded-full mr-1">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${calculateSectionProgress(section)}%`,
                          backgroundColor: 
                            calculateSectionProgress(section) < 30 ? (darkMode ? '#ef444480' : '#EF4444') : 
                            calculateSectionProgress(section) < 70 ? (darkMode ? '#f59e0b80' : '#F59E0B') : 
                            (darkMode ? '#10b98180' : '#10B981')
                        }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${
                      calculateSectionProgress(section) < 30 ? 'text-rose-500 dark:text-rose-400' : 
                      calculateSectionProgress(section) < 70 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'
                    }`}>
                      {calculateSectionProgress(section)}%
                    </span>
                    
                    {/* Section rating badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${scoreRating.color} ${scoreRating.bgColor} ${darkMode ? scoreRating.darkBgColor : ''}`}>
                      {getScoreRating(calculateSectionProgress(section)).label}
                    </span>
                  </div>
                </div>
                
                <svg 
                  className={`w-5 h-5 transform transition-transform duration-300 ${section.expanded ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {section.expanded && (
                <div className={`p-5 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-100'}`}>
                  {section.items && (
                    <div className="mb-4 grid gap-1">
                      {section.items.map(item => (
                        <div 
                          key={item.id} 
                          className={`flex items-start p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input 
                                type="checkbox" 
                                id={item.id}
                                checked={item.checked}
                                onChange={() => toggleItem(item.id, section.id)}
                                className={`h-5 w-5 rounded border-2 transition-colors duration-200 focus:ring-2 focus:ring-offset-2 
                                  ${darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600 focus:ring-offset-gray-800' 
                                    : 'bg-white border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-white'}`}
                              />
                            </div>
                            <label 
                              htmlFor={item.id} 
                              className={`ml-3 text-sm transition-all duration-200 ${item.checked 
                                ? (darkMode ? 'line-through text-gray-500' : 'line-through text-gray-400') 
                                : (darkMode ? 'text-gray-200' : 'text-gray-700')}`}
                            >
                              {item.text}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.subsections && section.subsections.map(subsection => (
                    <div key={subsection.id} className="mb-5">
                      <h3 className={`font-medium text-lg mb-3 pb-2 ${darkMode ? 'text-gray-200 border-b border-gray-700' : 'text-gray-800 border-b border-gray-200'}`}>
                        {subsection.title}
                      </h3>
                      <div className="pl-2 grid gap-1">
                        {subsection.items.map(item => (
                          <div 
                            key={item.id} 
                            className={`flex items-start p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                          >
                            <div className="relative flex items-start">
                              <div className="flex items-center h-5">
                                <input 
                                  type="checkbox" 
                                  id={item.id}
                                  checked={item.checked}
                                  onChange={() => toggleItem(item.id, section.id, subsection.id)}
                                  className={`h-5 w-5 rounded border-2 transition-colors duration-200 focus:ring-2 focus:ring-offset-2 
                                    ${darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600 focus:ring-offset-gray-800' 
                                      : 'bg-white border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-white'}`}
                                />
                              </div>
                              <label 
                                htmlFor={item.id} 
                                className={`ml-3 text-sm transition-all duration-200 ${item.checked 
                                  ? (darkMode ? 'line-through text-gray-500' : 'line-through text-gray-400') 
                                  : (darkMode ? 'text-gray-200' : 'text-gray-700')}`}
                              >
                                {item.text}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className={`mt-10 pb-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex justify-center gap-6 mb-4">
            <a 
              href="https://aws.amazon.com/aws-cost-management/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
              AWS Cost Management Resources
            </a>
            <a 
              href="https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              Well-Architected Framework (Cost Optimization)
            </a>
          </div>
          <p className="text-xs opacity-75">
            Updated 2025 • Track your AWS cost optimization journey and save money on your cloud infrastructure
          </p>
        </footer>
      </div>
    </div>
  );
};
  
  export default AWSCostChecklist;